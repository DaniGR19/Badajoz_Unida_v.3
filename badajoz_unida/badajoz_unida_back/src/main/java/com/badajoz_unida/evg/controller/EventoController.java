package com.badajoz_unida.evg.controller;

import com.badajoz_unida.evg.dto.NewEventDTO;
import com.badajoz_unida.evg.exception.CustomException;
import com.badajoz_unida.evg.service.EventoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import java.io.IOException;

@RestController
@RequestMapping("/eventos")
@CrossOrigin(origins="http://localhost:4200")
public class EventoController {
    @Autowired
    EventoService eventoService;

    @PostMapping(value = "/save", consumes = MediaType.MULTIPART_FORM_DATA_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> saveEvent(HttpServletRequest request, @ModelAttribute NewEventDTO nuevoEvento){
        try{
            return new ResponseEntity<>(this.eventoService.save(nuevoEvento),HttpStatus.OK);
        }catch (CustomException e){
            return new ResponseEntity<>(e.getErrorCode().getMensaje(), HttpStatus.INTERNAL_SERVER_ERROR);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }
}