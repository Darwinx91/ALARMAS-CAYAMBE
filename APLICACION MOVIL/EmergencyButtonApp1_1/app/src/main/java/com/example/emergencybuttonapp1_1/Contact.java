package com.example.emergencybuttonapp1_1;

public class Contact {
    private String id;
    private String nombre;
    private String numero;


    public Contact() {
    }


    public Contact(String id, String nombre, String numero) {
        this.id = id;
        this.nombre = nombre;
        this.numero = numero;
    }


    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getNumero() {
        return numero;
    }

    public void setNumero(String numero) {
        this.numero = numero;
    }
}

