package sn.uchk.university.auth.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.util.Set;

@Getter
@Setter
@Builder
public class AuthResponse {

    private String token;

    private String tokenType;

    private UserConnectedDto user;
}