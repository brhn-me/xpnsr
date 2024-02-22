package com.brhn.xpnsr.services;

import com.brhn.xpnsr.exceptions.NotFoundError;
import com.brhn.xpnsr.models.Category;
import com.brhn.xpnsr.repositories.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;

    @Autowired
    public CategoryService(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    public Category add(Category category) {
        return categoryRepository.save(category);
    }

    public Category update(Long id, Category categoryDetails) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new NotFoundError("Category not found with id " + id));
        category.setName(categoryDetails.getName());
        category.setIcon(categoryDetails.getIcon());
        category.setDescription(categoryDetails.getDescription());
        category.setParentId(categoryDetails.getParentId());
        return categoryRepository.save(category);
    }

    public Category getCategoryById(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new NotFoundError("Category not found with id " + id));
    }

    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }

    public void delete(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new NotFoundError("Category not found with id " + id));
        categoryRepository.delete(category);
    }
}