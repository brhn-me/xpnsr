package com.brhn.xpnsr.services;

import com.brhn.xpnsr.exceptions.NotFoundError;
import com.brhn.xpnsr.models.Transaction;
import com.brhn.xpnsr.repositories.TransactionRepository;
import com.brhn.xpnsr.services.dtos.TransactionDTO;
import com.brhn.xpnsr.services.mappers.TransactionMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final TransactionMapper transactionMapper;

    @Autowired
    public TransactionService(TransactionRepository transactionRepository, TransactionMapper transactionMapper) {
        this.transactionRepository = transactionRepository;
        this.transactionMapper = transactionMapper;
    }

    public TransactionDTO add(TransactionDTO transactionDTO) {
        Transaction transaction = transactionMapper.transactionDTOToTransaction(transactionDTO);
        transactionRepository.save(transaction);
        return transactionMapper.transactionToTransactionDTO(transaction);
    }

    public TransactionDTO update(Long id, TransactionDTO transactionDTO) {
        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Transaction not found with id " + id));

        transaction = transactionMapper.transactionDTOToTransaction(transactionDTO);
        transaction.setId(id);
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
}
