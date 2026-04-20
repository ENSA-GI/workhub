package com.workhub.gateway.api;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.util.StreamUtils;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestClient;

import java.io.IOException;
import java.util.Enumeration;

@RestController
public class ProxyController {

    private final RestClient restClient = RestClient.create();

    @Value("${workhub.gateway.org}") private String orgBase;
    @Value("${workhub.gateway.employee}") private String employeeBase;
    @Value("${workhub.gateway.identity}") private String identityBase;
    @Value("${workhub.gateway.leave}") private String leaveBase;
    @Value("${workhub.gateway.notifications}") private String notifBase;
    @Value("${workhub.gateway.payroll}") private String payrollBase;
    @Value("${workhub.gateway.recruitment}") private String recruitmentBase;
    @Value("${workhub.gateway.documents}") private String documentsBase;
    @Value("${workhub.gateway.audit}") private String auditBase;

    @RequestMapping("/org/**")
    public ResponseEntity<byte[]> org(HttpServletRequest req) throws IOException {
        return forward(orgBase, "/org", req);
    }

    @RequestMapping("/employee/**")
    public ResponseEntity<byte[]> employee(HttpServletRequest req) throws IOException {
        return forward(employeeBase, "/employee", req);
    }

    @RequestMapping("/identity/**")
    public ResponseEntity<byte[]> identity(HttpServletRequest req) throws IOException {
        return forward(identityBase, "/identity", req);
    }

    @RequestMapping("/leave/**")
    public ResponseEntity<byte[]> leave(HttpServletRequest req) throws IOException {
        return forward(leaveBase, "/leave", req);
    }

    @RequestMapping("/notifications/**")
    public ResponseEntity<byte[]> notifications(HttpServletRequest req) throws IOException {
        return forward(notifBase, "/notifications", req);
    }

    @RequestMapping("/payroll/**")
    public ResponseEntity<byte[]> payroll(HttpServletRequest req) throws IOException {
        return forward(payrollBase, "/payroll", req);
    }

    @RequestMapping("/recruitment/**")
    public ResponseEntity<byte[]> recruitment(HttpServletRequest req) throws IOException {
        return forward(recruitmentBase, "/recruitment", req);
    }

    @RequestMapping("/documents/**")
    public ResponseEntity<byte[]> documents(HttpServletRequest req) throws IOException {
        return forward(documentsBase, "/documents", req);
    }

    @RequestMapping("/audit/**")
    public ResponseEntity<byte[]> audit(HttpServletRequest req) throws IOException {
        return forward(auditBase, "/audit", req);
    }

    private ResponseEntity<byte[]> forward(String baseUrl, String prefix, HttpServletRequest req) throws IOException {
        String uri = req.getRequestURI();
        String subPath = uri.substring(prefix.length());
        if (subPath.isEmpty()) subPath = "/";

        String query = req.getQueryString();
        String targetUrl = baseUrl + "/api" + subPath + (query != null ? "?" + query : "");

        HttpHeaders headers = new HttpHeaders();
        Enumeration<String> headerNames = req.getHeaderNames();
        while (headerNames.hasMoreElements()) {
            String h = headerNames.nextElement();
            if (h.equalsIgnoreCase("host")) continue;
            headers.add(h, req.getHeader(h));
        }

        byte[] body = StreamUtils.copyToByteArray(req.getInputStream());
        HttpMethod method = HttpMethod.valueOf(req.getMethod());

        RestClient.RequestBodySpec spec = restClient.method(method).uri(targetUrl).headers(h -> h.addAll(headers));

        ResponseEntity<byte[]> resp = (body.length > 0)
                ? spec.body(body).retrieve().toEntity(byte[].class)
                : spec.retrieve().toEntity(byte[].class);

        return resp;
    }
}