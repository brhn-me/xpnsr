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

/**
 * REST controller for generating transaction reports.
 * Provides endpoints to retrieve monthly and yearly reports based on transaction types.
 */
@RestController
@RequestMapping("/api/reports")
public class ReportsApi {
    private final TransactionService transactionService;

    /**
     * Constructs a new ReportsApi instance with the specified TransactionService.
     *
     * @param transactionService the service for handling transaction operations
     */
    public ReportsApi(TransactionService transactionService) {
        this.transactionService = transactionService;
    }

    /**
     * Retrieves a monthly report based on the specified transaction type.
     *
     * @param transactionType the type of transaction ('EARNING' or 'EXPENSE')
     * @return a list of ReportDTO containing transaction details for the current month
     */
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

    /**
     * Retrieves a yearly report based on the specified transaction type.
     *
     * @param transactionType the type of transaction ('EARNING' or 'EXPENSE')
     * @return a list of ReportDTO containing transaction details for the current year
     */
    @GetMapping("/yearly-{transactionType}")
    public List<ReportDTO> getYearlyReport(@PathVariable String transactionType) {
        Year currentYear = Year.now();
        LocalDate startDate = currentYear.atDay(1);
        LocalDate endDate = currentYear.atMonth(12).atEndOfMonth();

        TransactionType type = TransactionType.EXPENSE;
        if ("EARNING".equals(transactionType)) {
            type = TransactionType.EARNING;
        }

        return transactionService.getTransactionsReport(type, startDate, endDate);
    }
}
