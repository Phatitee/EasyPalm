// frontend/src/config/menuConfig.js
import {
    UsersIcon, ShoppingCartIcon, ClockIcon, ScaleIcon, CircleStackIcon, UserGroupIcon,
    RectangleStackIcon, ClipboardDocumentListIcon, DocumentCheckIcon, TruckIcon, ArchiveBoxIcon,
    ArrowUpOnSquareIcon, BriefcaseIcon, CheckBadgeIcon,
    DocumentTextIcon, BanknotesIcon,
    ChartPieIcon, PresentationChartLineIcon,BuildingStorefrontIcon,ClipboardDocumentCheckIcon
} from '@heroicons/react/24/outline';

export const MENU_CONFIG = {
    // --- พนักงานจัดซื้อ ---
    purchasing: [
        {
            title: 'ธุรกรรมจัดซื้อ',
            items: [
                { icon: ShoppingCartIcon, text: 'รับซื้อสินค้า', path: '/purchasing/create-po' },
                { icon: ClockIcon, text: 'ประวัติการซื้อ', path: '/purchasing/history' },
            ]
        },
        {
            title: 'การจัดการ',
            items: [
                { icon: ScaleIcon, text: 'กำหนดราคารับซื้อ', path: '/purchasing/prices' },
                { icon: UserGroupIcon, text: 'ข้อมูลเกษตรกร', path: '/purchasing/farmers' },
                { icon: CircleStackIcon, text: 'ตรวจสอบ Stock', path: '/purchasing/stock-summary' },
            ]
        }
    ],

    // --- เจ้าหน้าที่คลังสินค้า ---
    warehouse: [
        {
            title: 'การรับสินค้า',
            items: [
                { icon: RectangleStackIcon, text: 'สินค้าที่รอจัดเก็บ', path: '/warehouse/pending-storage' },
                { icon: ClipboardDocumentListIcon, text: 'ประวัติการจัดเก็บ', path: '/warehouse/storage-history' },
            ]
        },
        {
            title: 'การเบิกสินค้า',
            items: [
                { icon: TruckIcon, text: 'สินค้าที่รอเบิกจริง', path: '/warehouse/pending-shipments' },
                { icon: ClipboardDocumentCheckIcon, text: 'ประวัติการเบิก', path: '/warehouse/shipment-history' },
            ]
        },
        {
            title: 'ภาพรวม',
            items: [
                { icon: ArchiveBoxIcon, text: 'สต็อกคงคลัง', path: '/warehouse/stock' },
                { icon: BuildingStorefrontIcon, text: 'จัดการคลังสินค้า', path: '/warehouse/management'},
            ]
        }
    ],

    // --- พนักงานฝ่ายขาย ---
    sales: [
        {
            title: 'ธุรกรรมการขาย',
            items: [
                { icon: ArrowUpOnSquareIcon, text: 'บันทึกคำสั่งขาย', path: '/sales/create-so' },
                { icon: ClockIcon, text: 'ประวัติการขาย', path: '/sales/history' },
                { icon: CheckBadgeIcon, text: 'ยืนยันการจัดส่ง', path: '/sales/confirm-delivery' },
            ]
        },
        {
            title: 'ข้อมูล',
            items: [
                { icon: BriefcaseIcon, text: 'ข้อมูลลูกค้า', path: '/sales/customers' },
                { icon: ArchiveBoxIcon, text: 'ตรวจสอบ Stock', path: '/sales/stock' },
            ]
        }
    ],

    // --- พนักงานบัญชี ---
    accountant: [
        {
            title: 'การเงิน',
            items: [
                { icon: DocumentTextIcon, text: 'จัดการชำระเงิน (ซื้อ)', path: '/accountant/po-payments' },
                { icon: BanknotesIcon, text: 'ยืนยันการรับเงิน (ขาย)', path: '/accountant/so-receipts' },
            ]
        },
        {
            title: 'ประวัติ',
            items: [
                { icon: ClockIcon, text: 'ประวัติการซื้อ', path: '/accountant/purchase-history' },
                { icon: ClockIcon, text: 'ประวัติการขาย', path: '/accountant/sales-history' },
            ]
        }
    ],

    // --- ผู้บริหาร ---
    executive: [
        {
            title: 'ภาพรวม',
            items: [
                { icon: ChartPieIcon, text: 'Dashboard', path: '/executive/dashboard' },
                { icon: PresentationChartLineIcon, text: 'รายงานกำไร-ขาดทุน', path: '/executive/profit-loss' },
            ]
        }
    ],

    // --- ผู้ดูแลระบบ ---
    admin: [
        {
            title: 'ระบบ',
            items: [
                { icon: UsersIcon, text: 'จัดการพนักงาน', path: '/admin/employees' },
            ]
        }
    ],
};