package sn.uchk.university.common.utils;

import org.springframework.stereotype.Component;

import java.time.Year;
import java.util.Random;

@Component
public class StageCodeGenerator {

    private static final String CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

    public String generate() {

        Random random = new Random();

        StringBuilder sb = new StringBuilder();

        for (int i = 0; i < 6; i++) {
            sb.append(CHARS.charAt(random.nextInt(CHARS.length())));
        }

        return "STG-" + Year.now().getValue() + "-" + sb;
    }
}