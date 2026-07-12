package com.ott.ms.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class SpaFallbackController {

    @RequestMapping(value = "{path:^(?!api|uploads|assets|.*\\.[a-zA-Z0-9]+$).*}")
    public String forward() {
        return "forward:/index.html";
    }
}
