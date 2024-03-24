package com.brhn.xpnsr.services;

import com.brhn.xpnsr.exceptions.NotFoundError;
import com.brhn.xpnsr.models.Bill;
import com.brhn.xpnsr.models.User;
import com.brhn.xpnsr.repositories.BillRepository;
import com.brhn.xpnsr.repositories.UserRepository;
import com.brhn.xpnsr.security.AuthenticationProvider;
import com.brhn.xpnsr.services.dtos.BillDTO;
import com.brhn.xpnsr.services.mappers.BillMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
public class BillService {

    private final BillRepository billRepository;
    private final UserRepository userRepository;
    private final BillMapper billMapper;

    @Autowired
    public BillService(BillRepository billRepository, UserRepository userRepository, BillMapper billMapper) {
        this.billRepository = billRepository;
        this.userRepository = userRepository;
        this.billMapper = billMapper;
    }

    public BillDTO createBill(BillDTO b) {
        Bill bill = billMapper.billDTOToBill(b);
        String username = AuthenticationProvider.getCurrentUsername();
        User user = userRepository.findByEmail("sample.user@example.com")
                .orElseThrow(() -> new NotFoundError("User not found with username: " + username));
        bill.setUser(user);

        bill = billRepository.save(bill);
        return billMapper.billToBillDTO(bill);
    }

    public BillDTO updateBill(Long id, BillDTO b) {
        billRepository.findById(id).orElseThrow(() -> new RuntimeException("Bill not found with id " + id));
        Bill bill = billMapper.billDTOToBill(b);
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
