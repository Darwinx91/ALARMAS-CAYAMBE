package com.example.emergencybuttonapp1_1;

import android.Manifest;
import android.app.PendingIntent;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.location.Address;
import android.location.Geocoder;
import android.location.Location;
import android.location.LocationListener;
import android.location.LocationManager;
import android.os.Bundle;
import android.os.Handler;
import android.telephony.SmsManager;
import android.util.Log;
import android.widget.Button;
import android.widget.ImageButton;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseUser;
import com.google.firebase.database.DataSnapshot;
import com.google.firebase.database.DatabaseError;
import com.google.firebase.database.DatabaseReference;
import com.google.firebase.database.FirebaseDatabase;
import com.google.firebase.database.ValueEventListener;

import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Locale;

public class HomeActivity extends AppCompatActivity {

    private static final int PERMISSION_REQUEST_CODE = 101;
    private DatabaseReference databaseReference;
    private FirebaseAuth auth;
    private String userId;
    private boolean isEmergencyActive = false;
    private ArrayList<Contact> contactList;
    private LocationManager locationManager;
    private String lastKnownLocation = "";
    private String address = "";
    private double latitude;
    private double longitude;
    private Button btnActivate;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_home);

        btnActivate = findViewById(R.id.btn_activate_emergency);
        Button btnDeactivate = findViewById(R.id.btn_deactivate_emergency);
        ImageButton navContactos = findViewById(R.id.nav_contactos);
        ImageButton navPerfil = findViewById(R.id.nav_perfil);

        auth = FirebaseAuth.getInstance();
        FirebaseUser user = auth.getCurrentUser();
        if (user == null) {
            Toast.makeText(this, "Error: No ha iniciado sesión", Toast.LENGTH_SHORT).show();
            finish();
            return;
        }
        userId = user.getUid();
        databaseReference = FirebaseDatabase.getInstance().getReference();

        contactList = new ArrayList<>();

        requestPermissions();
        locationManager = (LocationManager) getSystemService(LOCATION_SERVICE);
        getLocationUpdates();

        btnActivate.setOnClickListener(v -> activateEmergency());
        btnDeactivate.setOnClickListener(v -> deactivateEmergency());

        navContactos.setOnClickListener(v -> startActivity(new Intent(this, ContactosActivity.class)));
        navPerfil.setOnClickListener(v -> startActivity(new Intent(this, PerfilActivity.class)));
    }

    private void requestPermissions() {
        String[] permissions = {Manifest.permission.SEND_SMS, Manifest.permission.ACCESS_FINE_LOCATION};
        ActivityCompat.requestPermissions(this, permissions, PERMISSION_REQUEST_CODE);
    }

    private void getLocationUpdates() {
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED) {
            locationManager.requestLocationUpdates(LocationManager.GPS_PROVIDER, 5000, 10, new LocationListener() {
                @Override
                public void onLocationChanged(@NonNull Location location) {
                    latitude = location.getLatitude();
                    longitude = location.getLongitude();
                    lastKnownLocation = "https://maps.google.com/?q=" + latitude + "," + longitude;

                    Geocoder geocoder = new Geocoder(HomeActivity.this, Locale.getDefault());
                    try {
                        List<Address> addresses = geocoder.getFromLocation(latitude, longitude, 1);
                        if (!addresses.isEmpty()) {
                            address = addresses.get(0).getAddressLine(0);
                        }
                    } catch (IOException e) {
                        Log.e("GEOCODER_ERROR", "Error al obtener dirección", e);
                    }
                }
            });
        }
    }

    private void activateEmergency() {
        if (!isEmergencyActive) {
            isEmergencyActive = true;
            btnActivate.setEnabled(false);

            new Handler().postDelayed(() -> {
                databaseReference.child("emergencyState").setValue(true);
                controlLed(true);
                sendAlertAndSms();
                Toast.makeText(this, "Emergencia activada", Toast.LENGTH_SHORT).show();
                btnActivate.setEnabled(true);
            }, 3000);
        } else {
            Toast.makeText(this, "La emergencia ya está activa", Toast.LENGTH_SHORT).show();
        }
    }

    private void deactivateEmergency() {
        if (isEmergencyActive) {
            isEmergencyActive = false;
            databaseReference.child("emergencyState").setValue(false);
            controlLed(false);
            Toast.makeText(this, "Emergencia desactivada", Toast.LENGTH_SHORT).show();
        } else {
            Toast.makeText(this, "La emergencia ya está desactivada", Toast.LENGTH_SHORT).show();
        }
    }

    private void controlLed(boolean state) {
        int ledValue = state ? 1 : 0;
        databaseReference.child("ledState").setValue(ledValue)
                .addOnSuccessListener(aVoid -> Log.d("LED", "LED actualizado en Firebase a " + ledValue))
                .addOnFailureListener(e -> Log.e("LED_ERROR", "Error al actualizar el LED en Firebase", e));
    }

    private void sendAlertAndSms() {
        String date = new SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()).format(new Date());
        String time = new SimpleDateFormat("HH:mm:ss", Locale.getDefault()).format(new Date());
        Alert alert = new Alert(date, time, address, latitude, longitude);
        databaseReference.child("alerts").push().setValue(alert);

        databaseReference.child("contactos").child(userId).addListenerForSingleValueEvent(new ValueEventListener() {
            @Override
            public void onDataChange(@NonNull DataSnapshot snapshot) {
                contactList.clear();
                for (DataSnapshot contactSnapshot : snapshot.getChildren()) {
                    Contact contact = contactSnapshot.getValue(Contact.class);
                    if (contact != null) {
                        Log.d("SMS_CONTACT", "Enviando SMS a: " + contact.getNombre() + " - " + contact.getNumero());
                        contactList.add(contact);
                    }
                }
                if (!contactList.isEmpty()) {
                    sendSmsToContacts("Emergencia! Necesito ayuda." + lastKnownLocation);
                } else {
                    Log.e("SMS_ERROR", "No hay contactos almacenados en Firebase");
                }
            }

            @Override
            public void onCancelled(@NonNull DatabaseError error) {
                Log.e("FIREBASE_ERROR", "Error al obtener contactos: " + error.getMessage());
            }
        });
    }

    private void sendSmsToContacts(String message) {
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.SEND_SMS) != PackageManager.PERMISSION_GRANTED) {
            Toast.makeText(this, "Permiso para enviar SMS denegado", Toast.LENGTH_SHORT).show();
            return;
        }

        SmsManager smsManager = SmsManager.getDefault();
        for (Contact contact : contactList) {
            String numero = contact.getNumero().replaceAll("[^+0-9]", "");
            try {
                PendingIntent sentPI = PendingIntent.getBroadcast(this, 0, new Intent("SMS_SENT"), PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
                smsManager.sendTextMessage(numero, null, message, sentPI, null);
                Log.d("SMS_SENT", "SMS enviado a " + numero);
            } catch (Exception e) {
                Log.e("SMS_ERROR", "Error al enviar SMS a " + contact.getNombre(), e);
            }
        }
    }
}
