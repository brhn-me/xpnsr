package com.brhn.xpnsr.services;

import com.brhn.xpnsr.models.Bill;
import com.brhn.xpnsr.repositories.BillRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BillService {

    private final BillRepository billRepository;

    @Autowired
    public BillService(BillRepository billRepository) {
        this.billRepository = billRepository;
    }

    public Bill createBill(Bill bill) {
        return billRepository.save(bill);
    }

    public Bill updateBill(Long id, Bill billDetails) {
        Bill bill = billRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Bill not found with id " + id));
        bill.setTenure(billDetails.getTenure());
        bill.setAmount(billDetails.getAmount());
        return billRepository.save(bill);
    }

    public Bill getBillById(Long id) {
        return billRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Bill not found with id " + id));
    }

    public List<Bill> getAllBills() {
        return billRepository.findAll();
    }

    public void deleteBill(Long id) {
        Bill bill = billRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Bill not found with id " + id));
        billRepository.delete(bill);
    }
}
