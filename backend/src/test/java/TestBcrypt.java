import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class TestBcrypt {
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        String hash1 = "$2a$10$slYQmyNdgTY18LGvgxPwHOSQKeIsa6T8W5dyabHd/R2X6B7Gy5i6S";
        String hash2 = "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy";
        System.out.println("123456 matches hash1: " + encoder.matches("123456", hash1));
        System.out.println("password123 matches hash2: " + encoder.matches("password123", hash2));
    }
}
