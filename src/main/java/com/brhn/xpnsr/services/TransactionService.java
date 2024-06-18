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

/**
 * Service class for managing operations related to transactions.
 */
@Service
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final TransactionMapper transactionMapper;

    /**
     * Constructs a TransactionService with necessary repositories and mappers.
     *
     * @param transactionRepository The repository for accessing Transaction entities.
     * @param categoryRepository The repository for accessing Category entities.
     * @param transactionMapper The mapper for converting between Transaction and TransactionDTO.
     * @param userRepository The repository for accessing User entities.
     */
    @Autowired
    public TransactionService(TransactionRepository transactionRepository,
                              CategoryRepository categoryRepository,
                              TransactionMapper transactionMapper,
                              UserRepository userRepository) {
        this.transactionRepository = transactionRepository;
        this.categoryRepository = categoryRepository;
        this.transactionMapper = transactionMapper;
        this.userRepository = userRepository;
    }

    /**
     * Updates the primary and secondary categories of a transaction based on the provided TransactionDTO.
     *
     * @param transaction The transaction entity to update.
     * @param transactionDTO The DTO containing updated transaction information.
     * @throws NotFoundError if either the primary or secondary category specified in the DTO does not exist.
     * @throws BadRequestError if the primary category ID is empty.
     */
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

    /**
     * Adds a new transaction based on the provided TransactionDTO.
     *
     * @param transactionDTO The DTO containing transaction information.
     * @return The created TransactionDTO.
     */
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

    /**
     * Updates an existing transaction identified by its ID.
     *
     * @param id The ID of the transaction to update.
     * @param transactionDTO The updated TransactionDTO.
     * @return The updated TransactionDTO.
     * @throws NotFoundError if the transaction with the specified ID cannot be found.
     */
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

    /**
     * Retrieves a transaction by its ID.
     *
     * @param id The ID of the transaction to retrieve.
     * @return The corresponding TransactionDTO.
     * @throws NotFoundError if the transaction with the specified ID cannot be found.
     */
    public TransactionDTO get(Long id) throws NotFoundError {
        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new NotFoundError("Transaction not found with id " + id));
        return transactionMapper.transactionToTransactionDTO(transaction);
    }

    /**
     * Retrieves all transactions paginated.
     *
     * @param pageable The pagination information.
     * @return A Page of TransactionDTOs.
     */
    public Page<TransactionDTO> getAll(Pageable pageable) {
        Page<Transaction> transactions = transactionRepository.findAll(pageable);
        return transactions.map(transactionMapper::transactionToTransactionDTO);
    }

    /**
     * Deletes a transaction by its ID.
     *
     * @param id The ID of the transaction to delete.
     * @throws NotFoundError if the transaction with the specified ID cannot be found.
     */
    public void delete(Long id) throws NotFoundError {
        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new NotFoundError("Transaction not found with id " + id));
        transactionRepository.delete(transaction);
    }

    /**
     * Generates a report of transactions based on transaction type, start date, and end date.
     *
     * @param transactionType The type of transactions to include in the report.
     * @param startDate The start date (inclusive) for filtering transactions.
     * @param endDate The end date (inclusive) for filtering transactions.
     * @return A list of ReportDTO objects containing category-wise transaction amounts.
     */
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
