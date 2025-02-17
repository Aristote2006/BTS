const PDFDocument = require('pdfkit');
const { Parser } = require('json2csv');
const Booking = require('../models/Booking');
const Route = require('../models/Route');
const Schedule = require('../models/Schedule');
const User = require('../models/User');

class ReportGenerator {
  constructor() {
    this.parser = new Parser();
  }

  async generateReport(type, format, startDate, endDate) {
    const data = await this.fetchReportData(type, startDate, endDate);
    return format === 'pdf' 
      ? await this.generatePDFReport(type, data)
      : this.generateCSVReport(data);
  }

  async fetchReportData(type, startDate, endDate) {
    const dateQuery = {
      createdAt: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    };

    switch (type) {
      case 'bookings':
        return await Booking.aggregate([
          { $match: dateQuery },
          {
            $lookup: {
              from: 'routes',
              localField: 'route',
              foreignField: '_id',
              as: 'routeDetails'
            }
          },
          { $unwind: '$routeDetails' },
          {
            $project: {
              bookingId: '$_id',
              route: { $concat: ['$routeDetails.from', ' → ', '$routeDetails.to'] },
              amount: '$totalAmount',
              status: 1,
              createdAt: 1,
              paymentMethod: 1
            }
          }
        ]);

      case 'revenue':
        return await Booking.aggregate([
          { $match: dateQuery },
          {
            $group: {
              _id: {
                date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                paymentMethod: '$paymentMethod'
              },
              totalRevenue: { $sum: '$totalAmount' },
              count: { $sum: 1 }
            }
          },
          { $sort: { '_id.date': 1 } }
        ]);

      // Add more report types here...
    }
  }

  async generatePDFReport(type, data) {
    const doc = new PDFDocument();
    const buffers = [];

    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => {});

    // Add report header
    doc.fontSize(20).text(`${type.charAt(0).toUpperCase() + type.slice(1)} Report`, {
      align: 'center'
    });
    doc.moveDown();

    // Add report data based on type
    switch (type) {
      case 'bookings':
        this.addBookingsToReport(doc, data);
        break;
      case 'revenue':
        this.addRevenueToReport(doc, data);
        break;
      // Add more report types...
    }

    doc.end();

    return Buffer.concat(buffers);
  }

  generateCSVReport(data) {
    return this.parser.parse(data);
  }

  addBookingsToReport(doc, bookings) {
    const tableTop = 150;
    const headers = ['Booking ID', 'Route', 'Amount', 'Status', 'Date'];
    
    // Add headers
    doc.fontSize(12);
    headers.forEach((header, i) => {
      doc.text(header, 50 + (i * 100), tableTop);
    });

    // Add data rows
    let y = tableTop + 30;
    bookings.forEach(booking => {
      if (y > 700) {
        doc.addPage();
        y = 50;
      }
      doc.text(booking.bookingId.toString().slice(-6), 50, y);
      doc.text(booking.route, 150, y);
      doc.text(booking.amount.toString(), 250, y);
      doc.text(booking.status, 350, y);
      doc.text(new Date(booking.createdAt).toLocaleDateString(), 450, y);
      y += 30;
    });
  }

  addRevenueToReport(doc, revenue) {
    // Add revenue report specific formatting
    // Implementation details...
  }
}

module.exports = new ReportGenerator(); 