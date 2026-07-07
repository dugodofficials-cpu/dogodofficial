import { config } from 'dotenv';
config({ path: `.env.${process.env.NODE_ENV || 'development'}` });
import { dbConnection } from '@backend/databases';
const EmailService = require('../email/email.service').default;
const mongoose = require('mongoose');
console.log(dbConnection);
let emailService: any;
async function initializeServices() {
  try {
    mongoose.set('strictQuery', false);
    await mongoose.connect(dbConnection.url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');
    emailService = new EmailService();
  } catch (error) {
    console.error('Failed to connect to database:', error.message);
    process.exit(1);
  }
}
const orderTemplates = [
  {
    name: 'order-confirmation',
    subject: 'Order Confirmation - {{orderNumber}}',
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Order Confirmation</h2>
        <p>Dear {{customerName}},</p>
        <p>Thank you for your order! We're excited to process your purchase.</p>
        <div style="background: #f9f9f9; padding: 20px; margin: 20px 0; border-radius: 5px;">
          <h3>Order Details</h3>
          <p><strong>Order Number:</strong> {{orderNumber}}</p>
          <p><strong>Order Date:</strong> {{orderDate}}</p>
          <p><strong>Total Amount:</strong> {{finalTotal}}</p>
          <p><strong>Estimated Delivery:</strong> {{estimatedDelivery}}</p>
        </div>
        <div style="background: #fff; border: 1px solid #ddd; padding: 20px; margin: 20px 0; border-radius: 5px;">
          <h3>Order Summary</h3>
          <p><strong>Subtotal:</strong> {{subtotal}}</p>
          <p><strong>Tax:</strong> {{tax}}</p>
          <p><strong>Shipping:</strong> {{shipping}}</p>
          <p><strong>Discount:</strong> {{discount}}</p>
          <p><strong>Final Total:</strong> {{finalTotal}}</p>
        </div>
        <p>We'll send you updates as your order progresses. If you have any questions, please don't hesitate to contact our support team.</p>
        <p>Best regards,<br>The Dugod Team</p>
      </div>
    `,
    variables: ['customerName', 'orderNumber', 'orderDate', 'total', 'items', 'subtotal', 'tax', 'shipping', 'discount', 'finalTotal', 'estimatedDelivery']
  },
  {
    name: 'order-processing',
    subject: 'Your Order is Being Processed - {{orderNumber}}',
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Order Processing</h2>
        <p>Dear {{customerName}},</p>
        <p>Great news! Your order is now being processed and prepared for shipping.</p>
        <div style="background: #f9f9f9; padding: 20px; margin: 20px 0; border-radius: 5px;">
          <h3>Order Details</h3>
          <p><strong>Order Number:</strong> {{orderNumber}}</p>
          <p><strong>Order Date:</strong> {{orderDate}}</p>
          <p><strong>Processing Date:</strong> {{processingDate}}</p>
          <p><strong>Estimated Delivery:</strong> {{estimatedDelivery}}</p>
        </div>
        <p>Our team is carefully preparing your items for shipment. You'll receive another email once your order ships with tracking information.</p>
        <p>Thank you for your patience!</p>
        <p>Best regards,<br>The Dugod Team</p>
      </div>
    `,
    variables: ['customerName', 'orderNumber', 'orderDate', 'processingDate', 'estimatedDelivery']
  },
  {
    name: 'order-shipped',
    subject: 'Your Order Has Shipped! - {{orderNumber}}',
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Order Shipped!</h2>
        <p>Dear {{customerName}},</p>
        <p>Exciting news! Your order has been shipped and is on its way to you.</p>
        <div style="background: #f9f9f9; padding: 20px; margin: 20px 0; border-radius: 5px;">
          <h3>Shipping Details</h3>
          <p><strong>Order Number:</strong> {{orderNumber}}</p>
          <p><strong>Shipping Date:</strong> {{shippingDate}}</p>
          <p><strong>Carrier:</strong> {{carrier}}</p>
          <p><strong>Tracking Number:</strong> {{trackingNumber}}</p>
          <p><strong>Estimated Delivery:</strong> {{estimatedDelivery}}</p>
          <p><strong>Shipping Address:</strong> {{shippingAddress}}</p>
        </div>
        <p>You can track your package using the tracking number above on the carrier's website.</p>
        <p>We'll notify you when your package is delivered!</p>
        <p>Best regards,<br>The Dugod Team</p>
      </div>
    `,
    variables: ['customerName', 'orderNumber', 'shippingDate', 'trackingNumber', 'carrier', 'estimatedDelivery', 'shippingAddress']
  },
  {
    name: 'order-delivered',
    subject: 'Your Order Has Been Delivered! - {{orderNumber}}',
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Order Delivered!</h2>
        <p>Dear {{customerName}},</p>
        <p>Your order has been successfully delivered!</p>
        <div style="background: #f9f9f9; padding: 20px; margin: 20px 0; border-radius: 5px;">
          <h3>Delivery Details</h3>
          <p><strong>Order Number:</strong> {{orderNumber}}</p>
          <p><strong>Delivery Date:</strong> {{deliveryDate}}</p>
          <p><strong>Delivery Address:</strong> {{deliveryAddress}}</p>
        </div>
        <p>We hope you love your purchase! If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
        <p>Thank you for choosing Dugod!</p>
        <p>Best regards,<br>The Dugod Team</p>
      </div>
    `,
    variables: ['customerName', 'orderNumber', 'deliveryDate', 'deliveryAddress']
  },
  {
    name: 'order-cancelled',
    subject: 'Order Cancellation - {{orderNumber}}',
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Order Cancelled</h2>
        <p>Dear {{customerName}},</p>
        <p>Your order has been cancelled as requested.</p>
        <div style="background: #f9f9f9; padding: 20px; margin: 20px 0; border-radius: 5px;">
          <h3>Cancellation Details</h3>
          <p><strong>Order Number:</strong> {{orderNumber}}</p>
          <p><strong>Order Date:</strong> {{orderDate}}</p>
          <p><strong>Cancellation Date:</strong> {{cancellationDate}}</p>
          <p><strong>Reason:</strong> {{reason}}</p>
          <p><strong>Refund Amount:</strong> {{refundAmount}}</p>
          <p><strong>Refund Timeframe:</strong> {{refundTimeframe}}</p>
        </div>
        <p>A refund of {{refundAmount}} will be processed and should appear in your account within {{refundTimeframe}}.</p>
        <p>If you have any questions about this cancellation, please contact our support team.</p>
        <p>Best regards,<br>The Dugod Team</p>
      </div>
    `,
    variables: ['customerName', 'orderNumber', 'orderDate', 'cancellationDate', 'reason', 'refundAmount', 'refundTimeframe']
  },
  {
    name: 'order-refunded',
    subject: 'Refund Processed - {{orderNumber}}',
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Refund Processed</h2>
        <p>Dear {{customerName}},</p>
        <p>Your refund has been processed successfully.</p>
        <div style="background: #f9f9f9; padding: 20px; margin: 20px 0; border-radius: 5px;">
          <h3>Refund Details</h3>
          <p><strong>Order Number:</strong> {{orderNumber}}</p>
          <p><strong>Refund Date:</strong> {{refundDate}}</p>
          <p><strong>Refund Amount:</strong> {{refundAmount}}</p>
          <p><strong>Refund Timeframe:</strong> {{refundTimeframe}}</p>
        </div>
        <p>The refund of {{refundAmount}} will be credited to your original payment method within {{refundTimeframe}}.</p>
        <p>Thank you for your understanding.</p>
        <p>Best regards,<br>The Dugod Team</p>
      </div>
    `,
    variables: ['customerName', 'orderNumber', 'refundDate', 'refundAmount', 'refundTimeframe']
  },
  {
    name: 'delivery-update',
    subject: 'Delivery Update - {{orderNumber}}',
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Delivery Update</h2>
        <p>Dear {{customerName}},</p>
        <p>{{statusMessage}}</p>
        <div style="background: #f9f9f9; padding: 20px; margin: 20px 0; border-radius: 5px;">
          <h3>Delivery Details</h3>
          <p><strong>Order Number:</strong> {{orderNumber}}</p>
          <p><strong>Status:</strong> {{deliveryStatus}}</p>
          <p><strong>Carrier:</strong> {{carrier}}</p>
          <p><strong>Tracking Number:</strong> {{trackingNumber}}</p>
          <p><strong>Estimated Delivery:</strong> {{estimatedDelivery}}</p>
        </div>
        <p>You can track your package using the tracking number above on the carrier's website.</p>
        <p>Best regards,<br>The Dugod Team</p>
      </div>
    `,
    variables: ['customerName', 'orderNumber', 'deliveryStatus', 'statusMessage', 'trackingNumber', 'carrier', 'estimatedDelivery']
  },
  {
    name: 'digital-delivery',
    subject: 'Digital Delivery - {{orderNumber}}',
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Digital Delivery</h2>
        <p>Dear {{customerName}},</p>
        <p>Your digital products are ready for download!</p>
        <div style="background: #f9f9f9; padding: 20px; margin: 20px 0; border-radius: 5px;">
          <h3>Download Details</h3>
          <p><strong>Order Number:</strong> {{orderNumber}}</p>
          <p><strong>Download Links:</strong> {{downloadLinks}}</p>
          <p><strong>Access Keys:</strong> {{accessKeys}}</p>
          <p><strong>Expiry Date:</strong> {{expiryDate}}</p>
          <p><strong>Download Count:</strong> {{downloadCount}}</p>
        </div>
        <p>Please save these links and access keys in a safe place. You can download your digital products using the links provided above.</p>
        <p>Enjoy your purchase!</p>
        <p>Best regards,<br>The Dugod Team</p>
      </div>
    `,
    variables: ['customerName', 'orderNumber', 'downloadLinks', 'accessKeys', 'expiryDate', 'downloadCount']
  },
  {
    name: 'order-status-update',
    subject: 'Order Status Update - {{orderNumber}}',
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Order Status Update</h2>
        <p>Dear {{customerName}},</p>
        <p>Your order status has been updated.</p>
        <div style="background: #f9f9f9; padding: 20px; margin: 20px 0; border-radius: 5px;">
          <h3>Status Change</h3>
          <p><strong>Order Number:</strong> {{orderNumber}}</p>
          <p><strong>Previous Status:</strong> {{previousStatus}}</p>
          <p><strong>New Status:</strong> {{newStatus}}</p>
          <p><strong>Update Date:</strong> {{updateDate}}</p>
        </div>
        <p>{{statusMessage}}</p>
        <p>Best regards,<br>The Dugod Team</p>
      </div>
    `,
    variables: ['customerName', 'orderNumber', 'previousStatus', 'newStatus', 'statusMessage', 'updateDate']
  },
  {
    name: 'low-stock-alert',
    subject: 'Low Stock Alert - {{orderNumber}}',
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Low Stock Alert</h2>
        <p>Dear {{customerName}},</p>
        <p>We wanted to let you know that one of the items in your order is currently low in stock.</p>
        <div style="background: #f9f9f9; padding: 20px; margin: 20px 0; border-radius: 5px;">
          <h3>Order Details</h3>
          <p><strong>Order Number:</strong> {{orderNumber}}</p>
          <p><strong>Product:</strong> {{productName}}</p>
          <p><strong>Order Date:</strong> {{orderDate}}</p>
        </div>
        <p>We're working to ensure your order is fulfilled as quickly as possible. If there are any delays, we'll keep you updated.</p>
        <p>Thank you for your patience!</p>
        <p>Best regards,<br>The Dugod Team</p>
      </div>
    `,
    variables: ['customerName', 'orderNumber', 'productName', 'orderDate']
  },
  {
    name: 'backorder-notification',
    subject: 'Backorder Notification - {{orderNumber}}',
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Backorder Notification</h2>
        <p>Dear {{customerName}},</p>
        <p>One of the items in your order is currently on backorder.</p>
        <div style="background: #f9f9f9; padding: 20px; margin: 20px 0; border-radius: 5px;">
          <h3>Backorder Details</h3>
          <p><strong>Order Number:</strong> {{orderNumber}}</p>
          <p><strong>Product:</strong> {{productName}}</p>
          <p><strong>Order Date:</strong> {{orderDate}}</p>
          <p><strong>Estimated Restock Date:</strong> {{estimatedRestockDate}}</p>
        </div>
        <p>We'll ship this item as soon as it becomes available. You'll receive a shipping notification when it's on its way.</p>
        <p>Thank you for your patience!</p>
        <p>Best regards,<br>The Dugod Team</p>
      </div>
    `,
    variables: ['customerName', 'orderNumber', 'productName', 'orderDate', 'estimatedRestockDate']
  }
];
async function setupOrderTemplates() {
  console.log('Setting up order email templates...');
  await initializeServices();
  for (const template of orderTemplates) {
    try {
      await emailService.createTemplate(template);
      console.log(`Created template: ${template.name}`);
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log(`Template already exists: ${template.name}`);
      } else {
        console.error(`Failed to create template ${template.name}:`, error.message);
      }
    }
  }
  console.log('Order email templates setup complete!');
  await mongoose.connection.close();
  console.log('Database connection closed');
}
if (require.main === module) {
  setupOrderTemplates().catch(console.error);
}
export default setupOrderTemplates;