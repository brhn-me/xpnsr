package com.brhn.xpnsr.services;

import com.brhn.xpnsr.exceptions.BadRequestError;
import com.brhn.xpnsr.exceptions.NotFoundError;
import com.brhn.xpnsr.models.Bill;
import com.brhn.xpnsr.models.User;
import com.brhn.xpnsr.repositories.BillRepository;
import com.brhn.xpnsr.repositories.CategoryRepository;
import com.brhn.xpnsr.repositories.UserRepository;
import com.brhn.xpnsr.security.AuthenticationProvider;
import com.brhn.xpnsr.services.dtos.BillDTO;
import com.brhn.xpnsr.services.mappers.BillMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

/**
 * Service class for handling operations related to bills.
 */
@Service
public class BillService {

    private final BillRepository billRepository;
    private final UserRepository userRepository;

    private final CategoryRepository categoryRepository;

    private final BillMapper billMapper;

    /**
     * Constructs a BillService with necessary repositories and mappers.
     *
     * @param billRepository     The repository for accessing Bill entities.
     * @param userRepository     The repository for accessing User entities.
     * @param categoryRepository
     * @param billMapper         The mapper for converting between Bill and BillDTO.
     */
    @Autowired
    public BillService(BillRepository billRepository, UserRepository userRepository, CategoryRepository categoryRepository, BillMapper billMapper) {
        this.billRepository = billRepository;
        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
        this.billMapper = billMapper;
    }

    /**
     * Creates a new bill based on the provided BillDTO.
     *
     * @param b The BillDTO containing bill information.
     * @return The created BillDTO.
     * @throws NotFoundError if the associated user cannot be found.
     */
    public BillDTO createBill(BillDTO b) {
        Bill bill = billMapper.billDTOToBill(b);
        String username = AuthenticationProvider.getCurrentUsername();
        User user = userRepository.findByEmail("sample.user@example.com")
                .orElseThrow(() -> new NotFoundError("User not found with username: " + username));
        bill.setUser(user);

        categoryRepository.findById(b.getCategoryId())
                .orElseThrow(() -> new BadRequestError("Category does not exist"));

        bill = billRepository.save(bill);
        return billMapper.billToBillDTO(bill);
    }

    /**
     * Updates an existing bill identified by its ID.
     *
     * @param id The ID of the bill to update.
     * @param b  The updated BillDTO.
     * @return The updated BillDTO.
     * @throws RuntimeException if the bill with the specified ID cannot be found.
     * @throws NotFoundError    if the associated user cannot be found.
     */
    public BillDTO updateBill(Long id, BillDTO b) {
        billRepository.findById(id).orElseThrow(() -> new RuntimeException("Bill not found with id " + id));
        Bill bill = billMapper.billDTOToBill(b);
        bill.setId(id);
        String username = AuthenticationProvider.getCurrentUsername();
        User user = userRepository.findByEmail("sample.user@example.com")
                .orElseThrow(() -> new NotFoundError("User not found with username: " + username));
        bill.setUser(user);

        categoryRepository.findById(b.getCategoryId())
                .orElseThrow(() -> new BadRequestError("Category does not exist"));

        bill = billRepository.save(bill);
        return billMapper.billToBillDTO(bill);
    }

    /**
     * Retrieves a bill by its ID.
     *
     * @param id The ID of the bill to retrieve.
     * @return The corresponding BillDTO.
     * @throws RuntimeException if the bill with the specified ID cannot be found.
     */
    public BillDTO getBillById(Long id) {
        Bill bill = billRepository.findById(id).orElseThrow(() -> new RuntimeException("Bill not found with id " + id));
        return billMapper.billToBillDTO(bill);
    }

    /**
     * Retrieves all bills paginated.
     *
     * @param pageable The pagination information.
     * @return A Page of BillDTOs.
     */
    public Page<BillDTO> getAllBills(Pageable pageable) {
        Page<Bill> bills = billRepository.findAll(pageable);
        return bills.map(billMapper::billToBillDTO);
    }

    /**
     * Deletes a bill by its ID.
     *
     * @param id The ID of the bill to delete.
     * @throws RuntimeException if the bill with the specified ID cannot be found.
     */
    public void deleteBill(Long id) {
        Bill bill = billRepository.findById(id).orElseThrow(() -> new RuntimeException("Bill not found with id " + id));
        billRepository.delete(bill);
    }
}