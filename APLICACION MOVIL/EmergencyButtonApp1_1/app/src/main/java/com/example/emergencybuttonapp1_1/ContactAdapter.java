package com.example.emergencybuttonapp1_1;

import android.content.Context;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.BaseAdapter;
import android.widget.TextView;
import java.util.ArrayList;

public class ContactAdapter extends BaseAdapter {

    private Context context;
    private ArrayList<Contact> contactosList;

    public ContactAdapter(Context context, ArrayList<Contact> contactosList) {
        this.context = context;
        this.contactosList = contactosList;
    }

    @Override
    public int getCount() {
        return contactosList.size();
    }

    @Override
    public Object getItem(int position) {
        return contactosList.get(position);
    }

    @Override
    public long getItemId(int position) {
        return position;
    }

    @Override
    public View getView(int position, View convertView, ViewGroup parent) {
        if (convertView == null) {
            convertView = LayoutInflater.from(context).inflate(android.R.layout.simple_list_item_2, parent, false);
        }

        TextView tvNombre = convertView.findViewById(android.R.id.text1);
        TextView tvNumero = convertView.findViewById(android.R.id.text2);

        Contact contacto = contactosList.get(position);
        tvNombre.setText(contacto.getNombre());
        tvNumero.setText(contacto.getNumero());

        return convertView;
    }
}