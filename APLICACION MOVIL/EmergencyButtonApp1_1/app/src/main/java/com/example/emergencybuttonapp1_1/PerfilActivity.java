package com.example.emergencybuttonapp1_1;

import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.preference.PreferenceManager;
import android.widget.Button;
import android.widget.EditText;
import android.widget.ImageView;
import android.widget.Toast;
import androidx.appcompat.app.AppCompatActivity;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseUser;
import com.google.firebase.firestore.DocumentReference;
import com.google.firebase.firestore.FirebaseFirestore;
import java.util.HashMap;
import java.util.Map;

public class PerfilActivity extends AppCompatActivity {

    private EditText etName, etUsername, etPronouns, etDescription;
    private Button btnSave, btnCerrarSesion, btnEliminarCuenta;
    private FirebaseAuth auth;
    private FirebaseFirestore db;
    private FirebaseUser user;
    private SharedPreferences sharedPreferences;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_perfil);


        auth = FirebaseAuth.getInstance();
        db = FirebaseFirestore.getInstance();
        user = auth.getCurrentUser();
        sharedPreferences = PreferenceManager.getDefaultSharedPreferences(this);


        etName = findViewById(R.id.et_name);
        etUsername = findViewById(R.id.et_username);
        etPronouns = findViewById(R.id.et_pronouns);
        etDescription = findViewById(R.id.et_description);
        btnSave = findViewById(R.id.btn_save);
        btnCerrarSesion = findViewById(R.id.btnCerrarSesion);
        btnEliminarCuenta = findViewById(R.id.btnEliminarCuenta);
        ImageView ivBack = findViewById(R.id.iv_back);


        cargarDatosUsuario();

        btnSave.setOnClickListener(v -> guardarCambios());
        btnCerrarSesion.setOnClickListener(v -> cerrarSesion());
        btnEliminarCuenta.setOnClickListener(v -> eliminarCuenta());
        ivBack.setOnClickListener(v -> finish());
    }

    private void cargarDatosUsuario() {

        etName.setText(sharedPreferences.getString("nombre", ""));
        etUsername.setText(sharedPreferences.getString("numero", ""));
        etPronouns.setText(sharedPreferences.getString("direccion", ""));
        etDescription.setText(sharedPreferences.getString("cedula", ""));


        if (user != null) {
            String uid = user.getUid();
            DocumentReference docRef = db.collection("usuarios").document(uid);
            docRef.get().addOnSuccessListener(documentSnapshot -> {
                if (documentSnapshot.exists()) {
                    String nombre = documentSnapshot.getString("nombre");
                    String numero = documentSnapshot.getString("numero");
                    String direccion = documentSnapshot.getString("direccion");
                    String cedula = documentSnapshot.getString("cedula");

                    etName.setText(nombre != null ? nombre : "");
                    etUsername.setText(numero != null ? numero : "");
                    etPronouns.setText(direccion != null ? direccion : "");
                    etDescription.setText(cedula != null ? cedula : "");


                    SharedPreferences.Editor editor = sharedPreferences.edit();
                    editor.putString("nombre", nombre);
                    editor.putString("numero", numero);
                    editor.putString("direccion", direccion);
                    editor.putString("cedula", cedula);
                    editor.apply();
                }
            });
        }
    }

    private void guardarCambios() {
        if (user != null) {
            String uid = user.getUid();
            DocumentReference docRef = db.collection("usuarios").document(uid);

            Map<String, Object> usuario = new HashMap<>();
            usuario.put("nombre", etName.getText().toString());
            usuario.put("numero", etUsername.getText().toString());
            usuario.put("direccion", etPronouns.getText().toString());
            usuario.put("cedula", etDescription.getText().toString());


            docRef.set(usuario).addOnSuccessListener(aVoid ->
                    Toast.makeText(PerfilActivity.this, "Datos actualizados", Toast.LENGTH_SHORT).show()
            ).addOnFailureListener(e ->
                    Toast.makeText(PerfilActivity.this, "Error al actualizar", Toast.LENGTH_SHORT).show()
            );


            SharedPreferences.Editor editor = sharedPreferences.edit();
            editor.putString("nombre", etName.getText().toString());
            editor.putString("numero", etUsername.getText().toString());
            editor.putString("direccion", etPronouns.getText().toString());
            editor.putString("cedula", etDescription.getText().toString());
            editor.apply();
        }
    }

    private void cerrarSesion() {
        auth.signOut();
        startActivity(new Intent(PerfilActivity.this, MainActivity.class));
        finish();
    }

    private void eliminarCuenta() {
        if (user != null) {
            String uid = user.getUid();
            db.collection("usuarios").document(uid).delete().addOnSuccessListener(aVoid -> {
                user.delete().addOnSuccessListener(aVoid1 -> {
                    Toast.makeText(PerfilActivity.this, "Cuenta eliminada", Toast.LENGTH_SHORT).show();
                    startActivity(new Intent(PerfilActivity.this, MainActivity.class));
                    finish();
                }).addOnFailureListener(e ->
                        Toast.makeText(PerfilActivity.this, "Error al eliminar cuenta", Toast.LENGTH_SHORT).show()
                );
            }).addOnFailureListener(e ->
                    Toast.makeText(PerfilActivity.this, "Error al eliminar datos", Toast.LENGTH_SHORT).show()
            );


            sharedPreferences.edit().clear().apply();
        }
    }
}