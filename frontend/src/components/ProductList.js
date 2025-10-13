import React, { useState, useEffect } from 'react';
import axios from 'axios'; // 1. import axios ที่เราเพิ่งติดตั้ง

// URL ของ Backend ของเรา
const API_URL = 'http://127.0.0.1:5000/products';

const ProductList = () => {
    // 2. สร้าง "State" หรือ "กล่องเก็บข้อมูล" ใน Component
    const [products, setProducts] = useState([]); // สำหรับเก็บข้อมูลสินค้า
    const [loading, setLoading] = useState(true); // สำหรับบอกสถานะว่ากำลังโหลดอยู่มั้ย
    const [error, setError] = useState(null);     // สำหรับเก็บข้อความ Error

    // 3. ใช้ useEffect เพื่อสั่งให้ "ทำงานทันที" เมื่อ Component นี้ถูกแสดงผล
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                // 4. ใช้ axios ยิง request แบบ GET ไปที่ Backend
                console.log("Fetching products from backend...");
                const response = await axios.get(API_URL);

                // 5. เมื่อสำเร็จ นำข้อมูลที่ได้ (response.data) มาใส่ใน state
                console.log("Data received:", response.data);
                setProducts(response.data);

            } catch (err) {
                // 6. หากล้มเหลว ให้เก็บข้อความ error ไว้
                console.error("Failed to fetch products:", err);
                setError('ไม่สามารถเชื่อมต่อกับ Server ได้');
            } finally {
                // 7. ไม่ว่าจะสำเร็จหรือล้มเหลว ให้บอกว่า "โหลดเสร็จแล้ว"
                setLoading(false);
            }
        };

        fetchProducts(); // สั่งให้ฟังก์ชันนี้ทำงาน
    }, []); // เครื่องหมาย [] แปลว่าให้ทำงานแค่ครั้งแรกครั้งเดียว

    // 8. เขียนเงื่อนไขการแสดงผลหน้าเว็บ
    if (loading) return <p>กำลังโหลดข้อมูลสินค้า...</p>;
    if (error) return <p style={{ color: 'red' }}>{error}</p>;

    return (
        <div style={{ border: '1px solid white', padding: '20px', marginTop: '20px' }}>
            <h2>รายการสินค้าจากฐานข้อมูล</h2>
            {products.length === 0 ? (
                <p>ยังไม่มีข้อมูลสินค้าในระบบ</p>
            ) : (
                <ul>
                    {/* 9. วนลูปแสดงข้อมูลสินค้าทุกชิ้นออกมา */}
                    {products.map((product) => (
                        <li key={product.p_id}>
                            {product.p_name} - ราคา: {product.price_per_unit} บาท
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default ProductList;