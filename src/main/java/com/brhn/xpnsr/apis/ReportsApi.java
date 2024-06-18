package com.brhn.xpnsr.apis;

import com.brhn.xpnsr.models.TransactionType;
import com.brhn.xpnsr.services.TransactionService;
import com.brhn.xpnsr.services.dtos.ReportDTO;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.time.Year;
import java.time.YearMonth;
import java.util.List;

@RestController
@RequestMapping("/api/reports")
public class ReportsApi {
    private final TransactionService transactionService;

    public ReportsApi(TransactionService transactionService) {
        this.transactionService = transactionService;
    }

    @GetMapping("/monthly-{transactionType}")
    public List<ReportDTO> getMonthlyReport(@PathVariable String transactionType) {
        YearMonth currentMonth = YearMonth.now();
        LocalDate startDate = currentMonth.atDay(1);
        LocalDate endDate = currentMonth.atEndOfMonth();

        TransactionType type = TransactionType.EXPENSE;
        if ("EARNING".equals(transactionType)) {
            type = TransactionType.EARNING;
        }

        return transactionService.getTransactionsReport(type, startDate, endDate);
    }

    @GetMapping("/yearly-{transactionType}")
    public List<ReportDTO> getYearlyReport(@PathVariable String transactionType) {
        Year currentYear = Year.now();
        LocalDate startDate = currentYear.atDay(1);
        LocalDate endDate = currentYear.atMonth(12).atEndOfMonth();

        TransactionType type = TransactionType.EXPENSE;
        if ("EARNING".equals(type)) {
            type = TransactionType.EARNING;
        }

        return transactionService.getTransactionsReport(type, startDate, endDate);
    }
}