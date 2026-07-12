package com.ott.ms.repository;

import com.ott.ms.model.Platform;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.Optional;
import java.util.List;

public interface PlatformRepository extends MongoRepository<Platform, String> {
    Optional<Platform> findByName(String name);
    List<Platform> findByStatus(String status);
}
