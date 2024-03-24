package com.brhn.xpnsr.services.mappers;

import com.brhn.xpnsr.models.Category;
import com.brhn.xpnsr.models.Transaction;
import com.brhn.xpnsr.services.dtos.TransactionDTO;
import org.springframework.stereotype.Component;


@Component
public class TransactionMapper {


    public Transaction transactionDTOToTransaction(TransactionDTO transactionDTO) {
        if (transactionDTO == null) {
            return null;
        }

        Transaction transaction = new Transaction();

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

        // set primary category
        if (transactionDTO.getPrimaryCategoryId() != null) {
            Category primaryCategory = new Category();
            primaryCategory.setId(transactionDTO.getPrimaryCategoryId());
            transaction.setPrimaryCategory(primaryCategory);
        }

        // set secondary category
        if (transactionDTO.getSecondaryCategoryId() != null) {
            Category secondaryCategory = new Category();
            secondaryCategory.setId(transactionDTO.getPrimaryCategoryId());
            transaction.setPrimaryCategory(secondaryCategory);
        }

        return transaction;
    }


    public TransactionDTO transactionToTransactionDTO(Transaction transaction) {
        if (transaction == null) {
            return null;
        }

        TransactionDTO transactionDTO = new TransactionDTO();

        transactionDTO.setPrimaryCategoryId(transactionPrimaryCategoryId(transaction));
        transactionDTO.setSecondaryCategoryId(transactionSecondaryCategoryId(transaction));
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

        return transactionDTO;
    }

    private String transactionPrimaryCategoryId(Transaction transaction) {
        if (transaction == null) {
            return null;
        }
        Category primaryCategory = transaction.getPrimaryCategory();
        if (primaryCategory == null) {
            return null;
        }
        String id = primaryCategory.getId();
        if (id == null) {
            return null;
        }
        return id;
    }

    private String transactionSecondaryCategoryId(Transaction transaction) {
        if (transaction == null) {
            return null;
        }
        Category secondaryCategory = transaction.getSecondaryCategory();
        if (secondaryCategory == null) {
            return null;
        }
        String id = secondaryCategory.getId();
        if (id == null) {
            return null;
        }
        return id;
    }
}
