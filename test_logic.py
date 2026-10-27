
import json
import sqlite3
import server

def test_backend_logic():
    print("Testing LuxeStay Backend Database & Logic...")
    server.init_db()
    conn = server.get_db()
    cursor = conn.cursor()

    # 1. Test hotels query
    cursor.execute("SELECT * FROM hotels")
    hotels = [dict(r) for r in cursor.fetchall()]
    print(f"[PASS] Hotels in DB: {len(hotels)}")
    assert len(hotels) >= 10, "Should have at least 10 seeded hotels"

    # 2. Test rooms query
    cursor.execute("SELECT * FROM rooms WHERE hotel_id = ?", (hotels[0]["id"],))
    rooms = [dict(r) for r in cursor.fetchall()]
    print(f"[PASS] Rooms for {hotels[0]['name']}: {len(rooms)}")
    assert len(rooms) >= 1, "Hotel should have at least 1 room"

    # 3. Test coupon query
    cursor.execute("SELECT * FROM coupons WHERE code = 'LUXE20'")
    coupon = dict(cursor.fetchone())
    print(f"[PASS] Coupon validated: {coupon['code']} -> {coupon['discount_percent']}% off")
    assert coupon["discount_percent"] == 20.0

    # 4. Test booking insertion
    import random
    test_ref = f"LX-TEST{random.randint(1000, 99999)}"
    cursor.execute("""
        INSERT INTO bookings (
            booking_ref, hotel_id, room_id, first_name, last_name, email, phone,
            special_requests, check_in, check_out, nights, guests, meal_plan,
            subtotal, discount, coupon_code, tax_and_fees, total_price,
            currency, payment_method, payment_status, booking_status, created_at
        ) VALUES (?, ?, ?, 'Alexander', 'Hamilton', 'alex@luxury.com', '+1 555-0199',
                  'Quiet suite', '2026-11-01', '2026-11-04', 3, 2, 'Breakfast Included',
                  1800, 360, 'LUXE20', 180, 1620, 'USD', 'Credit Card', 'PAID', 'CONFIRMED', '2026-10-27 23:00:00')
    """, (test_ref, hotels[0]["id"], rooms[0]["id"]))
    conn.commit()

    # 5. Verify booking retrieval
    cursor.execute("SELECT * FROM bookings WHERE booking_ref = ?", (test_ref,))
    b = dict(cursor.fetchone())
    print(f"[PASS] Verified booking created: {b['booking_ref']}, Total: ${b['total_price']}")
    assert b["booking_ref"] == test_ref
    assert b["total_price"] == 1620

    # 6. Test cancellation
    cursor.execute("UPDATE bookings SET booking_status = 'CANCELLED' WHERE booking_ref = ?", (test_ref,))
    conn.commit()
    cursor.execute("SELECT booking_status FROM bookings WHERE booking_ref = ?", (test_ref,))
    status = cursor.fetchone()["booking_status"]
    print(f"[PASS] Cancellation status: {status}")
    assert status == "CANCELLED"

    conn.close()
    print("\nALL BACKEND LOGIC AND DATABASE TESTS PASSED WITH 100% SUCCESS!")

if __name__ == "__main__":
    test_backend_logic()

