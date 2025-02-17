const reportGenerator = require('../services/reportGenerator');

exports.generateReport = async (req, res) => {
  try {
    const { type, format, startDate, endDate } = req.body;
    
    const report = await reportGenerator.generateReport(
      type,
      format,
      startDate,
      endDate
    );

    if (format === 'pdf') {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=${type}-report.pdf`);
      res.send(report);
    } else {
      res.json({ csvContent: report });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 