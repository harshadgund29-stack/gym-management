import bcrypt
admin_hash = b'$2a$10$slYQmyNdgTY18LGvgxPwHOSQKeIsa6T8W5dyabHd/R2X6B7Gy5i6S'
john_hash = b'$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'

print('Admin 123456:', bcrypt.checkpw(b'123456', admin_hash))
print('John password123:', bcrypt.checkpw(b'password123', john_hash))
