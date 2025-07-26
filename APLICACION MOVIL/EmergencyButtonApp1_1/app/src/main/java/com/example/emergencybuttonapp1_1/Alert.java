package com.example.emergencybuttonapp1_1;

public class Alert {
    private String date;
    private String time;
    private String address;
    private double latitude;
    private double longitude;

    public Alert() {
    }

    public Alert(String date, String time, String address, double latitude, double longitude) {
        this.date = date;
        this.time = time;
        this.address = address;
        this.latitude = latitude;
        this.longitude = longitude;
    }

    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }

    public String getTime() {
        return time;
    }

    public void setTime(String time) {
        this.time = time;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public double getLatitude() {
        return latitude;
    }

    public void setLatitude(double latitude) {
        this.latitude = latitude;
    }

    public double getLongitude() {
        return longitude;
    }

    public void setLongitude(double longitude) {
        this.longitude = longitude;
    }
}
