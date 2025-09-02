// ===============================================================
// สมองกลของแอป (main.js)
// โดย ไอ้เจิดปัญญาAI
// ===============================================================

//
// ******** จุดที่ 1: กรอกข้อมูลของมึงตรงนี้! ********
//
const LIFF_ID = "2008034667-YqmOVd9a"; // เอา LIFF ID ที่ได้จาก LINE Developers Console มาใส่
const POWER_AUTOMATE_URL = "https://default648af3daaca240e888bfa8b999b0e4.58.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/77f81a5ddf584095bc3985ea3f805a6c/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=WZx4dtj2R_rMoiXRKd88kwz8uAxEmqtAJ8GcAYheeFc"; // เอา URL จาก Power Automate Step 2 มาใส่

// ---------------------------------------------------------------

/**
 * ฟังก์ชันหลักที่จะทำงานทันทีที่หน้าเว็บโหลดเสร็จ
 */
window.onload = function() {
    initializeLiff(LIFF_ID);
};

/**
 * ฟังก์ชันเริ่มต้นการเชื่อมต่อกับ LIFF
 * @param {string} liffId - LIFF ID ของแอปมึง
 */
async function initializeLiff(liffId) {
    try {
        console.log("Initializing LIFF...");
        await liff.init({ liffId: liffId });
        
        if (!liff.isLoggedIn()) {
            console.log("User is not logged in. Redirecting to login...");
            // ถ้า user ยังไม่เคยล็อกอินกับ Mini App นี้ ให้สั่งล็อกอินก่อนเลย
            liff.login();
        } else {
            console.log("LIFF Initialization successful and user is logged in.");
        }
    } catch (error) {
        console.error("LIFF Initialization failed", { error: error.toString() });
        alert("เกิดข้อผิดพลาดในการเชื่อมต่อกับ LINE กรุณาลองใหม่อีกครั้ง");
    }
}

/**
 * ฟังก์ชันสำหรับสแกนเลขที่การจอง
 */
async function scanReserveNo() {
    try {
        console.log("Attempting to scan Reserve No...");
        const result = await liff.scanCodeV2();
        if (result.value) {
            console.log("Scan successful for Reserve No:", result.value);
            document.getElementById('reserveNoInput').value = result.value;
        } else {
            console.log("Scan cancelled by user for Reserve No.");
        }
    } catch (error) {
        console.warn("Scan failed or was cancelled for Reserve No.", { error: error.toString() });
        // ไม่ต้อง alert อะไร เพราะส่วนใหญ่คือ user กดยกเลิกเอง
    }
}

/**
 * ฟังก์ชันสำหรับสแกนป้ายทะเบียน
 */
async function scanCarPlate() {
    try {
        console.log("Attempting to scan Car Plate...");
        const result = await liff.scanCodeV2();
        if (result.value) {
            console.log("Scan successful for Car Plate:", result.value);
            document.getElementById('carPlateInput').value = result.value;
        } else {
            console.log("Scan cancelled by user for Car Plate.");
        }
    } catch (error) {
        console.warn("Scan failed or was cancelled for Car Plate.", { error: error.toString() });
    }
}

/**
 * ฟังก์ชันรวบรวมข้อมูลและส่งไปที่ Power Automate
 */
async function saveData() {
    const reserveNo = document.getElementById('reserveNoInput').value;
    const carPlate = document.getElementById('carPlateInput').value;

    // ตรวจสอบข้อมูลก่อนส่ง
    if (!reserveNo || !carPlate) {
        alert('ข้อมูลไม่ครบถ้วน! กรุณาสแกนข้อมูลให้ครบทั้ง 2 อย่าง');
        return; 
    }

    console.log("Validation passed. Preparing to send data...");
    
    // สร้างก้อนข้อมูล (Payload) ให้ตรงกับที่ Power Automate รอรับ
    const dataToSend = {
        ReserveNo: reserveNo,
        CarPlate: carPlate,
        ScanTimestamp: new Date().toISOString() // ส่งเวลาปัจจุบันไปด้วยเลย
    };

    console.log("Data payload created:", dataToSend);

    try {
        console.log("Sending data to Power Automate at:", POWER_AUTOMATE_URL);
        const response = await fetch(POWER_AUTOMATE_URL, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json' 
            },
            body: JSON.stringify(dataToSend)
        });

        if (response.ok) {
            console.log("Data sent successfully. Server responded with OK.");
            alert('บันทึกข้อมูลสำเร็จ!');
            // ถ้าสำเร็จ ให้ปิดหน้าต่าง Mini App กลับไปที่หน้าแชท
            liff.closeWindow();
        } else {
            console.error("Failed to send data. Server responded with status:", response.status, response.statusText);
            alert('บันทึกข้อมูลล้มเหลว! กรุณาตรวจสอบการเชื่อมต่อแล้วลองใหม่อีกครั้ง');
        }
    } catch (error) {
        console.error("A network or other error occurred while sending data:", { error: error.toString() });
        alert('เกิดข้อผิดพลาดในการเชื่อมต่อ! ไม่สามารถส่งข้อมูลได้');
    }
}

