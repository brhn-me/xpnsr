package com.brhn.xpnsr.services;

import com.brhn.xpnsr.exceptions.BadRequestError;
import com.brhn.xpnsr.exceptions.NotFoundError;
import com.brhn.xpnsr.models.Category;
import com.brhn.xpnsr.models.Transaction;
import com.brhn.xpnsr.models.TransactionType;
import com.brhn.xpnsr.models.User;
import com.brhn.xpnsr.repositories.CategoryRepository;
import com.brhn.xpnsr.repositories.TransactionRepository;
import com.brhn.xpnsr.repositories.UserRepository;
import com.brhn.xpnsr.security.AuthenticationProvider;
import com.brhn.xpnsr.services.dtos.ReportDTO;
import com.brhn.xpnsr.services.dtos.TransactionDTO;
import com.brhn.xpnsr.services.mappers.TransactionMapper;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.sql.Timestamp;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final CategoryRepository categoryRepository;

    private final UserRepository userRepository;
    private final TransactionMapper transactionMapper;

    @Autowired
    public TransactionService(TransactionRepository transactionRepository,
                              CategoryRepository categoryRepository, TransactionMapper transactionMapper,
                              UserRepository userRepository) {
        this.transactionRepository = transactionRepository;
        this.categoryRepository = categoryRepository;
        this.userRepository = userRepository;
        this.transactionMapper = transactionMapper;
    }

    private void updatePrimaryAndSecondaryCategoryFromDTO(Transaction transaction, TransactionDTO transactionDTO) {
        if (!StringUtils.isEmpty(transactionDTO.getPrimaryCategoryId())) {
            Optional<Category> primaryCategory = categoryRepository.findById(transactionDTO.getPrimaryCategoryId());
            if (primaryCategory.isEmpty()) {
                throw new NotFoundError(String.format("Primary category with id : %s not found",
                        transactionDTO.getPrimaryCategoryId()));
            }

            transaction.setPrimaryCategory(primaryCategory.get());

            if (!StringUtils.isEmpty(transactionDTO.getSecondaryCategoryId())) {
                Optional<Category> secondaryCategory = categoryRepository.findById(transactionDTO.getSecondaryCategoryId());
                if (secondaryCategory.isEmpty()) {
                    throw new NotFoundError(String.format("Secondary category with id : %s not found",
                            transactionDTO.getSecondaryCategoryId()));
                }

                transaction.setSecondaryCategory(secondaryCategory.get());
            }
        } else {
            throw new BadRequestError("Primary category ID cannot be empty");
        }
    }

    public TransactionDTO add(TransactionDTO transactionDTO) {
        Transaction transaction = transactionMapper.transactionDTOToTransaction(transactionDTO);

        String username = AuthenticationProvider.getCurrentUsername();
        User user = userRepository.findByEmail("sample.user@example.com")
                .orElseThrow(() -> new NotFoundError("User not found with username: " + username));
        transaction.setUser(user);
        updatePrimaryAndSecondaryCategoryFromDTO(transaction, transactionDTO);
        transactionRepository.save(transaction);


        return transactionMapper.transactionToTransactionDTO(transaction);
    }

    public TransactionDTO update(Long id, TransactionDTO transactionDTO) {
        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new NotFoundError("Transaction not found with id " + id));

        transaction = transactionMapper.transactionDTOToTransaction(transactionDTO);
        transaction.setId(id);
        String username = AuthenticationProvider.getCurrentUsername();
        User user = userRepository.findByEmail("sample.user@example.com")
                .orElseThrow(() -> new NotFoundError("User not found with username: " + username));
        transaction.setUser(user);
        updatePrimaryAndSecondaryCategoryFromDTO(transaction, transactionDTO);
        transaction = transactionRepository.save(transaction);
        return transactionMapper.transactionToTransactionDTO(transaction);
    }

    public TransactionDTO get(Long id) throws NotFoundError {
        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new NotFoundError("Transaction not found with id " + id));
        return transactionMapper.transactionToTransactionDTO(transaction);
    }

    public Page<TransactionDTO> getAll(Pageable pageable) {
        Page<Transaction> transactions = transactionRepository.findAll(pageable);
        return transactions.map(transactionMapper::transactionToTransactionDTO);
    }

    public void delete(Long id) throws NotFoundError {
        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new NotFoundError("Transaction not found with id " + id));
        transactionRepository.delete(transaction);
    }

    public List<ReportDTO> getTransactionsReport(TransactionType transactionType, LocalDate startDate, LocalDate endDate) {
        Timestamp startTimestamp = Timestamp.valueOf(startDate.atStartOfDay());
        Timestamp endTimestamp = Timestamp.valueOf(endDate.plusDays(1).atStartOfDay().minusNanos(1));

        List<Transaction> transactions = transactionRepository.findByTypeAndDateBetween(transactionType, startTimestamp, endTimestamp);

        Map<Category, BigDecimal> collection = transactions.stream()
                .collect(Collectors.groupingBy(Transaction::getPrimaryCategory,
                        Collectors.reducing(BigDecimal.ZERO, Transaction::getAmount, BigDecimal::add)));

        return collection.entrySet().stream()
                .map(entry -> {
                    ReportDTO reportDTO = new ReportDTO();
                    reportDTO.setCategory(entry.getKey().getName());
                    reportDTO.setAmount(entry.getValue());
                    return reportDTO;
                })
                .collect(Collectors.toList());
    }
}
