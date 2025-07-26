package com.example.emergencybuttonapp1_1;

import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.text.TextUtils;
import android.widget.Button;
import android.widget.EditText;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthInvalidCredentialsException;
import com.google.firebase.auth.FirebaseUser;

public class ForgotPasswordActivity extends AppCompatActivity {

    private EditText etEmail, etNewPassword;
    private Button btnSendResetEmail, btnUpdatePassword;
    private FirebaseAuth mAuth;
    private String emailFromLink;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_forgot_password);

        mAuth = FirebaseAuth.getInstance();

        etEmail = findViewById(R.id.et_email);
        etNewPassword = findViewById(R.id.et_new_password);
        btnSendResetEmail = findViewById(R.id.btn_send_reset_email);
        btnUpdatePassword = findViewById(R.id.btn_update_password);

        btnSendResetEmail.setOnClickListener(v -> sendPasswordResetEmail());
        btnUpdatePassword.setOnClickListener(v -> updatePassword());

        handlePasswordResetLink();
    }

    private void sendPasswordResetEmail() {
        String email = etEmail.getText().toString().trim();

        if (TextUtils.isEmpty(email)) {
            Toast.makeText(this, "Ingresa tu correo electrónico", Toast.LENGTH_SHORT).show();
            return;
        }

        mAuth.sendPasswordResetEmail(email)
                .addOnCompleteListener(task -> {
                    if (task.isSuccessful()) {
                        Toast.makeText(this, "Correo de recuperación enviado. Revisa tu bandeja de entrada.", Toast.LENGTH_LONG).show();
                        finish();
                    } else {
                        Toast.makeText(this, "Error: " + task.getException().getMessage(), Toast.LENGTH_SHORT).show();
                    }
                });
    }

    private void handlePasswordResetLink() {
        Intent intent = getIntent();
        Uri data = intent.getData();

        if (data != null) {
            String link = data.toString();
            if (mAuth.isSignInWithEmailLink(link)) {
                emailFromLink = getIntent().getStringExtra("email");
                etEmail.setText(emailFromLink);
                etEmail.setEnabled(false);
                btnSendResetEmail.setEnabled(false);
                etNewPassword.setVisibility(EditText.VISIBLE);
                btnUpdatePassword.setVisibility(Button.VISIBLE);
            }
        }
    }

    private void updatePassword() {
        String newPassword = etNewPassword.getText().toString().trim();

        if (TextUtils.isEmpty(newPassword) || newPassword.length() < 6) {
            Toast.makeText(this, "La nueva contraseña debe tener al menos 6 caracteres", Toast.LENGTH_SHORT).show();
            return;
        }

        if (emailFromLink == null) {
            Toast.makeText(this, "Error: No se pudo verificar el correo.", Toast.LENGTH_SHORT).show();
            return;
        }

        mAuth.signInWithEmailLink(emailFromLink, getIntent().getData().toString())
                .addOnCompleteListener(task -> {
                    if (task.isSuccessful()) {
                        FirebaseUser user = task.getResult().getUser();
                        if (user != null) {
                            user.updatePassword(newPassword)
                                    .addOnCompleteListener(updateTask -> {
                                        if (updateTask.isSuccessful()) {
                                            Toast.makeText(this, "Contraseña actualizada correctamente.", Toast.LENGTH_SHORT).show();
                                            finish();
                                        } else {
                                            Toast.makeText(this, "Error al actualizar la contraseña.", Toast.LENGTH_SHORT).show();
                                        }
                                    });
                        }
                    } else {
                        if (task.getException() instanceof FirebaseAuthInvalidCredentialsException) {
                            Toast.makeText(this, "El enlace no es válido o ha expirado.", Toast.LENGTH_SHORT).show();
                        } else {
                            Toast.makeText(this, "Error al verificar el enlace.", Toast.LENGTH_SHORT).show();
                        }
                    }
                });
    }
}