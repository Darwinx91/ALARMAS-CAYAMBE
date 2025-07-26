package com.example.emergencybuttonapp1_1;

import android.content.Intent;
import android.os.Bundle;
import android.text.TextUtils;
import android.util.Log;
import android.widget.Button;
import android.widget.EditText;
import android.widget.TextView;
import android.widget.Toast;

import com.google.firebase.database.FirebaseDatabase;
import com.google.firebase.messaging.FirebaseMessaging;

import androidx.appcompat.app.AppCompatActivity;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseUser;

public class MainActivity extends AppCompatActivity {

    private EditText etEmail, etPassword;
    private Button btnLogin, btnRegister;
    private TextView tvForgotPassword;
    private FirebaseAuth mAuth;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        mAuth = FirebaseAuth.getInstance();

        // Inicializa FirebaseAuth
        mAuth = FirebaseAuth.getInstance();

        // Obtén el token de FCM
        FirebaseMessaging.getInstance().getToken()
                .addOnCompleteListener(task -> {
                    if (!task.isSuccessful()) {
                        Toast.makeText(this, "Error al obtener token FCM", Toast.LENGTH_SHORT).show();
                        return;
                    }

                    // Token de FCM
                    String fcmToken = task.getResult();

                    // Mostrar en un Toast (temporal)
                    Toast.makeText(this, "Token FCM: " + fcmToken, Toast.LENGTH_LONG).show();

                    // Imprimir en los logs
                    Log.d("FCM_TOKEN", "Token FCM: " + fcmToken);

                    // Opcional: Envía el token a tu backend
                    sendTokenToServer(fcmToken);
                });



        etEmail = findViewById(R.id.et_email);
        etPassword = findViewById(R.id.et_password);
        btnLogin = findViewById(R.id.btn_login_submit);
        btnRegister = findViewById(R.id.btn_register);
        tvForgotPassword = findViewById(R.id.tv_forgot_password); // Recuperamos el TextView

        FirebaseUser currentUser = mAuth.getCurrentUser();
        if (currentUser != null) {
            navigateToHome();
        }

        btnLogin.setOnClickListener(v -> loginUser());
        btnRegister.setOnClickListener(v -> navigateToRegisterActivity());
        tvForgotPassword.setOnClickListener(v -> resetPassword()); // Agregamos evento para "Olvidé mi contraseña"
    }

    private void sendTokenToServer(String token) {
        // Aquí puedes enviar el token a tu backend o base de datos Firebase
        // Ejemplo usando Firebase Realtime Database:
        FirebaseUser currentUser = mAuth.getCurrentUser();
        if (currentUser != null) {
            String userId = currentUser.getUid();
            FirebaseDatabase.getInstance().getReference("tokens")
                    .child(userId)
                    .setValue(token)
                    .addOnCompleteListener(task -> {
                        if (task.isSuccessful()) {
                            Toast.makeText(this, "Token registrado exitosamente", Toast.LENGTH_SHORT).show();
                        } else {
                            Toast.makeText(this, "Error al registrar el token", Toast.LENGTH_SHORT).show();
                        }
                    });
        }
    }

    private void loginUser() {
        String email = etEmail.getText().toString().trim();
        String password = etPassword.getText().toString().trim();

        if (TextUtils.isEmpty(email) || TextUtils.isEmpty(password)) {
            Toast.makeText(this, "Por favor, ingresa tu correo y contraseña", Toast.LENGTH_SHORT).show();
            return;
        }

        mAuth.signInWithEmailAndPassword(email, password)
                .addOnCompleteListener(this, task -> {
                    if (task.isSuccessful()) {
                        FirebaseUser user = mAuth.getCurrentUser();
                        if (user != null) {
                            Toast.makeText(this, "Bienvenido " + user.getEmail(), Toast.LENGTH_SHORT).show();
                            navigateToHome();
                        }
                    } else {
                        String errorMessage = (task.getException() != null) ? task.getException().getMessage() : "Credenciales incorrectas o problema desconocido";
                        Toast.makeText(this, "Error al iniciar sesión: " + errorMessage, Toast.LENGTH_SHORT).show();
                    }
                });
    }

    private void resetPassword() {
        String email = etEmail.getText().toString().trim();

        if (TextUtils.isEmpty(email)) {
            Toast.makeText(this, "Ingresa tu correo para restablecer la contraseña", Toast.LENGTH_SHORT).show();
            return;
        }

        mAuth.sendPasswordResetEmail(email)
                .addOnCompleteListener(task -> {
                    if (task.isSuccessful()) {
                        Toast.makeText(this, "Se envió un correo para restablecer tu contraseña", Toast.LENGTH_LONG).show();
                    } else {
                        String errorMessage = (task.getException() != null) ? task.getException().getMessage() : "Error desconocido";
                        Toast.makeText(this, "Error: " + errorMessage, Toast.LENGTH_SHORT).show();
                    }
                });
    }

    private void navigateToRegisterActivity() {
        Intent intent = new Intent(this, RegisterActivity.class);
        startActivity(intent);
    }

    private void navigateToHome() {
        Intent intent = new Intent(this, HomeActivity.class);
        startActivity(intent);
        finish();
    }
}
