package com.ott.ms.dto;

public class TokenRefreshRequest {
    private String token;

    public TokenRefreshRequest() {}

    public TokenRefreshRequest(String token) {
        this.token = token;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }
}
