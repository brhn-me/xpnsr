package com.brhn.xpnsr.services;

import com.brhn.xpnsr.exceptions.NotFoundError;
import com.brhn.xpnsr.models.Transaction;
import com.brhn.xpnsr.repositories.TransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TransactionService {

    private final TransactionRepository transactionRepository;

    @Autowired
    public TransactionService(TransactionRepository transactionRepository) {
        this.transactionRepository = transactionRepository;
    }

    public Transaction add(Transaction transaction) {
        return transactionRepository.save(transaction);
    }

    public Transaction update(Long id, Transaction transactionDetails) {
        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Transaction not found with id " + id));
        transaction.setDate(transactionDetails.getDate());
        transaction.setType(transactionDetails.getType());
//        transaction.setPrimaryCategory(transactionDetails.getPrimaryCategory());
//        transaction.setSecondaryCategory(transactionDetails.getSecondaryCategory());
        transaction.setAmount(transactionDetails.getAmount());
        transaction.setDue(transactionDetails.getDue());
        transaction.setTitle(transactionDetails.getTitle());
        transaction.setCurrency(transactionDetails.getCurrency());
        transaction.setCity(transactionDetails.getCity());
        transaction.setDescription(transactionDetails.getDescription());
        transaction.setTags(transactionDetails.getTags());
        return transactionRepository.save(transaction);
    }

    public Transaction get(Long id) throws NotFoundError {
        return transactionRepository.findById(id)
                .orElseThrow(() -> new NotFoundError("Transaction not found with id " + id));
    }

    public List<Transaction> getAll() {
        return transactionRepository.findAll();
    }

    public void delete(Long id) throws NotFoundError {
        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new NotFoundError("Transaction not found with id " + id));
        transactionRepository.delete(transaction);
    }
}
