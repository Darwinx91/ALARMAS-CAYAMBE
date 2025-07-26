package com.example.emergencybuttonapp1_1;

import android.app.Activity;
import android.content.Intent;
import android.database.Cursor;
import android.net.Uri;
import android.os.Bundle;
import android.provider.ContactsContract;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.ImageView;
import android.widget.ListView;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseUser;
import com.google.firebase.database.DataSnapshot;
import com.google.firebase.database.DatabaseError;
import com.google.firebase.database.DatabaseReference;
import com.google.firebase.database.FirebaseDatabase;
import com.google.firebase.database.ValueEventListener;

import java.util.ArrayList;

public class ContactosActivity extends AppCompatActivity {

    private static final int PICK_CONTACT_REQUEST = 1;
    private EditText etNombreContacto, etNumeroContacto;
    private Button btnAgregarContacto, btnSeleccionarContacto;
    private ImageView ivBack;
    private ListView lvContactos;
    private ArrayList<Contact> contactosList;
    private ContactAdapter contactAdapter;

    private DatabaseReference databaseReference;
    private FirebaseAuth auth;
    private String userId;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_contactos);

        // Referencias de la UI
        ivBack = findViewById(R.id.iv_back);
        etNombreContacto = findViewById(R.id.et_nombre_contacto);
        etNumeroContacto = findViewById(R.id.et_numero_contacto);
        btnAgregarContacto = findViewById(R.id.btn_agregar_contacto);
        btnSeleccionarContacto = findViewById(R.id.btn_seleccionar_contacto);
        lvContactos = findViewById(R.id.lv_contactos);

        // Inicializar Firebase
        auth = FirebaseAuth.getInstance();
        FirebaseUser user = auth.getCurrentUser();

        if (user == null) {
            Toast.makeText(this, "Error: No se ha iniciado sesión", Toast.LENGTH_SHORT).show();
            finish();
            return;
        }

        userId = user.getUid();
        databaseReference = FirebaseDatabase.getInstance().getReference("contactos").child(userId);

        // Inicializar lista y adaptador
        contactosList = new ArrayList<>();
        contactAdapter = new ContactAdapter(this, contactosList);
        lvContactos.setAdapter(contactAdapter);

        // Listeners
        btnAgregarContacto.setOnClickListener(v -> agregarContacto());
        btnSeleccionarContacto.setOnClickListener(v -> seleccionarContacto());
        ivBack.setOnClickListener(v -> finish()); // Regresar a la pantalla anterior

        cargarContactosDeFirebase();
    }

    private void agregarContacto() {
        String nombre = etNombreContacto.getText().toString().trim();
        String numero = etNumeroContacto.getText().toString().trim();

        if (nombre.isEmpty() || numero.isEmpty()) {
            Toast.makeText(this, "Por favor, ingresa un nombre y un número de contacto", Toast.LENGTH_SHORT).show();
        } else {
            String id = databaseReference.push().getKey();
            Contact nuevoContacto = new Contact(id, nombre, numero);

            if (id != null) {
                databaseReference.child(id).setValue(nuevoContacto).addOnCompleteListener(task -> {
                    if (task.isSuccessful()) {
                        contactosList.add(nuevoContacto);
                        contactAdapter.notifyDataSetChanged();

                        etNombreContacto.setText("");
                        etNumeroContacto.setText("");

                        Toast.makeText(this, "Contacto agregado", Toast.LENGTH_SHORT).show();
                    } else {
                        Toast.makeText(this, "Error al agregar contacto", Toast.LENGTH_SHORT).show();
                    }
                });
            }
        }
    }

    private void cargarContactosDeFirebase() {
        databaseReference.addValueEventListener(new ValueEventListener() {
            @Override
            public void onDataChange(@NonNull DataSnapshot snapshot) {
                contactosList.clear();
                for (DataSnapshot dataSnapshot : snapshot.getChildren()) {
                    Contact contacto = dataSnapshot.getValue(Contact.class);
                    if (contacto != null) {
                        contactosList.add(contacto);
                    }
                }
                contactAdapter.notifyDataSetChanged();
            }

            @Override
            public void onCancelled(@NonNull DatabaseError error) {
                Toast.makeText(ContactosActivity.this, "Error al cargar contactos", Toast.LENGTH_SHORT).show();
            }
        });
    }

    private void seleccionarContacto() {
        Intent intent = new Intent(Intent.ACTION_PICK, ContactsContract.CommonDataKinds.Phone.CONTENT_URI);
        startActivityForResult(intent, PICK_CONTACT_REQUEST);
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);

        if (requestCode == PICK_CONTACT_REQUEST && resultCode == Activity.RESULT_OK) {
            if (data != null && data.getData() != null) {
                Uri contactUri = data.getData();
                obtenerDetallesDelContacto(contactUri);
            }
        }
    }

    private void obtenerDetallesDelContacto(Uri contactUri) {
        String nombre = "";
        String numero = "";

        Cursor cursor = getContentResolver().query(contactUri, null, null, null, null);
        if (cursor != null && cursor.moveToFirst()) {
            int nombreIndex = cursor.getColumnIndex(ContactsContract.CommonDataKinds.Phone.DISPLAY_NAME);
            nombre = cursor.getString(nombreIndex);

            int numeroIndex = cursor.getColumnIndex(ContactsContract.CommonDataKinds.Phone.NUMBER);
            numero = cursor.getString(numeroIndex);

            cursor.close();
        }

        if (!nombre.isEmpty() && !numero.isEmpty()) {
            etNombreContacto.setText(nombre);
            etNumeroContacto.setText(numero);
        } else {
            Toast.makeText(this, "No se pudo obtener el contacto", Toast.LENGTH_SHORT).show();
        }
    }
}
