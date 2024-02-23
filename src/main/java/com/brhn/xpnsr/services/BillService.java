package com.brhn.xpnsr.services;

import com.brhn.xpnsr.models.Bill;
import com.brhn.xpnsr.repositories.BillRepository;
import com.brhn.xpnsr.services.dtos.BillDTO;
import com.brhn.xpnsr.services.mappers.BillMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
public class BillService {

    private final BillRepository billRepository;
    private final BillMapper billMapper;

    @Autowired
    public BillService(BillRepository billRepository, BillMapper billMapper) {
        this.billRepository = billRepository;
        this.billMapper = billMapper;
    }

    public BillDTO createBill(BillDTO b) {
        Bill bill = billMapper.billDTOToBill(b);
        bill = billRepository.save(bill);
        return billMapper.billToBillDTO(bill);
    }

    public BillDTO updateBill(Long id, BillDTO b) {
        Bill bill = billRepository.findById(id).orElseThrow(() -> new RuntimeException("Bill not found with id " + id));
        bill = billMapper.billDTOToBill(b);
        bill.setId(id);
        bill = billRepository.save(bill);
        return billMapper.billToBillDTO(bill);
    }

    public BillDTO getBillById(Long id) {
        Bill bill = billRepository.findById(id).orElseThrow(() -> new RuntimeException("Bill not found with id " + id));
        return billMapper.billToBillDTO(bill);
    }

    public Page<BillDTO> getAllBills(Pageable pageable) {
        Page<Bill> bills = billRepository.findAll(pageable);
        return bills.map(billMapper::billToBillDTO);
    }

    public void deleteBill(Long id) {
        Bill bill = billRepository.findById(id).orElseThrow(() -> new RuntimeException("Bill not found with id " + id));
        billRepository.delete(bill);
    }
}
