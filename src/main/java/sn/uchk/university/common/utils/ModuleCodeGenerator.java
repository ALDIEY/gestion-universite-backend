package sn.uchk.university.common.utils;

import org.springframework.stereotype.Component;

import java.time.Year;
import java.util.Random;

@Component
public class ModuleCodeGenerator {

    private static final String CHARACTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

    public String generate() {
        Random random = new Random();
        StringBuilder code = new StringBuilder();

        for (int i = 0; i < 6; i++) {
            code.append(CHARACTERS.charAt(random.nextInt(CHARACTERS.length())));
        }

        return "MOD-" + Year.now().getValue() + "-" + code;
    }
}