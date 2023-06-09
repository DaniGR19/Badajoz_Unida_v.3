package com.badajoz_unida.evg.service;

import com.badajoz_unida.evg.dto.UserInterestDTO;
import com.badajoz_unida.evg.entity.Categorias;
import com.badajoz_unida.evg.entity.UsuariosIntereses;
import org.springframework.http.ResponseEntity;

import java.util.List;

public interface UsuarioInteresesService {
    /**
     * Método para hacer el registro de un usuario con el interés deseado
     * @param interesesUsuario
     * @return
     */
    ResponseEntity<?> save(UserInterestDTO interesesUsuario);

}
