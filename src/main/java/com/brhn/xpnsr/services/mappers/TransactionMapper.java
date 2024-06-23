package com.brhn.xpnsr.services.mappers;

import com.brhn.xpnsr.models.Category;
import com.brhn.xpnsr.models.Transaction;
import com.brhn.xpnsr.services.dtos.TransactionDTO;
import org.springframework.stereotype.Component;

/**
 * Mapper class to convert between Transaction entities and TransactionDTO data transfer objects.
 */
@Component
public class TransactionMapper {

    /**
     * Converts a TransactionDTO to a Transaction entity.
     *
     * @param transactionDTO The TransactionDTO to convert.
     * @return The corresponding Transaction entity, or null if the input is null.
     */
    public Transaction transactionDTOToTransaction(TransactionDTO transactionDTO) {
        if (transactionDTO == null) {
            return null;
        }

        Transaction transaction = new Transaction();

        // Set properties from TransactionDTO to Transaction entity
        transaction.setId(transactionDTO.getId());
        transaction.setDate(transactionDTO.getDate());
        transaction.setType(transactionDTO.getType());
        transaction.setAmount(transactionDTO.getAmount());
        transaction.setDue(transactionDTO.getDue());
        transaction.setTitle(transactionDTO.getTitle());
        transaction.setCurrency(transactionDTO.getCurrency());
        transaction.setCity(transactionDTO.getCity());
        transaction.setCountry(transactionDTO.getCountry());
        transaction.setDescription(transactionDTO.getDescription());
        transaction.setTags(transactionDTO.getTags());

        // Set primary category
        if (transactionDTO.getPrimaryCategoryId() != null) {
            Category primaryCategory = new Category();
            primaryCategory.setId(transactionDTO.getPrimaryCategoryId());
            transaction.setPrimaryCategory(primaryCategory);
        }

        // Set secondary category
        if (transactionDTO.getSecondaryCategoryId() != null) {
            Category secondaryCategory = new Category();
            secondaryCategory.setId(transactionDTO.getSecondaryCategoryId());
            transaction.setSecondaryCategory(secondaryCategory);
        }

        return transaction;
    }

    /**
     * Converts a Transaction entity to a TransactionDTO.
     *
     * @param transaction The Transaction entity to convert.
     * @return The corresponding TransactionDTO, or null if the input is null.
     */
    public TransactionDTO transactionToTransactionDTO(Transaction transaction) {
        if (transaction == null) {
            return null;
        }

        TransactionDTO transactionDTO = new TransactionDTO();

        // Set properties from Transaction entity to TransactionDTO
        transactionDTO.setId(transaction.getId());
        transactionDTO.setDate(transaction.getDate());
        transactionDTO.setType(transaction.getType());
        transactionDTO.setAmount(transaction.getAmount());
        transactionDTO.setDue(transaction.getDue());
        transactionDTO.setTitle(transaction.getTitle());
        transactionDTO.setCurrency(transaction.getCurrency());
        transactionDTO.setCity(transaction.getCity());
        transactionDTO.setCountry(transaction.getCountry());
        transactionDTO.setDescription(transaction.getDescription());
        transactionDTO.setTags(transaction.getTags());

        // Set primary category ID
        transactionDTO.setPrimaryCategoryId(transactionPrimaryCategoryId(transaction));

        // Set secondary category ID
        transactionDTO.setSecondaryCategoryId(transactionSecondaryCategoryId(transaction));

        return transactionDTO;
    }

    /**
     * Retrieves the ID of the primary category associated with the Transaction.
     *
     * @param transaction The Transaction entity.
     * @return The ID of the primary category, or null if not set or if the transaction is null.
     */
    private String transactionPrimaryCategoryId(Transaction transaction) {
        if (transaction == null) {
            return null;
        }
        Category primaryCategory = transaction.getPrimaryCategory();
        if (primaryCategory == null) {
            return null;
        }
        return primaryCategory.getId();
    }

    /**
     * Retrieves the ID of the secondary category associated with the Transaction.
     *
     * @param transaction The Transaction entity.
     * @return The ID of the secondary category, or null if not set or if the transaction is null.
     */
    private String transactionSecondaryCategoryId(Transaction transaction) {
        if (transaction == null) {
            return null;
        }
        Category secondaryCategory = transaction.getSecondaryCategory();
        if (secondaryCategory == null) {
            return null;
        }
        return secondaryCategory.getId();
    }
}