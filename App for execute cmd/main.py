import tkinter as tk
from tkinter import font
from PIL import Image, ImageTk
from tkinter import messagebox
import os
import subprocess
import webbrowser
import psutil

process_front = None
process_back = None
def open_cmd():
    global process_front, process_back
    front_end = 'C:/Wamase FingerPrintReader/fingerprint-reader'
    command_front = "npm start"

    back_end = 'C:/Wamase FingerPrintReader/API_Of_Authentication/API_Of_Authentication'
    command_back = "python manage.py runserver"

    if os.path.isdir(back_end):
        os.chdir(back_end)
        process_back = subprocess.Popen(['cmd', '/K', command_back], creationflags=subprocess.CREATE_NEW_CONSOLE)  # /K mantiene la ventana abierta
    else:
        return messagebox.showwarning('Error', 'No se encontro la ruta del back end')
    
    if os.path.isdir(front_end):
        os.chdir(front_end)
        process_front = subprocess.Popen(['cmd', '/K', command_front], creationflags=subprocess.CREATE_NEW_CONSOLE)  # /K mantiene la ventana abierta
        webbrowser.open_new('http://localhost:4200')
        return messagebox.showinfo('Info', 'Proyecto abierto')
    else:
        return messagebox.WARNING('Error', 'No se encontro la ruta del front end')
    
def close_cmd():
    global process_front, process_back

    if process_back:
        try:
            parent = psutil.Process(process_back.pid)
            for child in parent.children(recursive=True):
                child.terminate()
            parent.terminate()
        except psutil.NoSuchProcess:
            pass
        process_back = None

    if process_front:
        try:
            parent = psutil.Process(process_front.pid)
            for child in parent.children(recursive=True):
                child.terminate()
            parent.terminate()
        except psutil.NoSuchProcess:
            pass
        process_front = None

    return messagebox.showinfo('Info', 'Proyectos cerrados')

# Crear la ventana principal
root = tk.Tk()
root.title("WAMASE FINGERPRINT")
root.geometry("520x460")
root.iconphoto(True, tk.PhotoImage(file="images/icon.png"))
root.configure(background="#FFFFFF")

# Frame principal para centrar todo el contenido
main_frame = tk.Frame(root, bg="#FFFFFF")
main_frame.pack(expand=True)

# Fuente personalizada
custom_font = font.Font(family="Helvetica", size=12, weight="bold")

# Título
titulo = tk.Label(main_frame, text="¡BIENVENIDO A WAMASE FINGER PRINT!", font=("Helvetica", 14, "bold"), bg="#FFFFFF")
titulo.pack(pady=10)

# Logo
logo = tk.PhotoImage(file="images/Logo.png")  # Asegúrate de tener esta imagen en el mismo directorio
logo_label = tk.Label(main_frame, image=logo, bg="#FFFFFF")
logo_label.pack(pady=10)

# Frame para los botones y la huella digital
button_frame = tk.Frame(main_frame, bg="#FFFFFF")
button_frame.pack(pady=10)

# Botón Iniciar Web
btn_iniciar_img = Image.open("images/Check.png")  # Cambia esta imagen por la correcta
btn_iniciar_img = btn_iniciar_img.resize((50, 50), Image.BILINEAR)
btn_iniciar_img = ImageTk.PhotoImage(btn_iniciar_img)
btn_iniciar = tk.Button(button_frame, text="Iniciar Web", font=custom_font, command=open_cmd, bg="#66BA46", fg="white", image=btn_iniciar_img, compound="left", width=150, height=50, relief="flat", borderwidth=2)
btn_iniciar.grid(row=0, column=0, padx=10)

# Huella digital
huella = tk.PhotoImage(file="images/FingerPrint.png")  # Asegúrate de tener esta imagen en el mismo directorio
huella_label = tk.Label(button_frame, image=huella, bg="#FFFFFF")
huella_label.grid(row=0, column=1, padx=10)

# Botón Cerrar Web
btn_cerrar_img = Image.open("images/X.png")  # Ruta a la imagen X.png
btn_cerrar_img = btn_cerrar_img.resize((50, 50), Image.BILINEAR)
btn_cerrar_img = ImageTk.PhotoImage(btn_cerrar_img)
btn_cerrar = tk.Button(button_frame, text="Cerrar Web", font=custom_font, command=close_cmd, bg="#1176B7", fg="white", image=btn_cerrar_img, compound="left", width=150, height=50, relief="flat", borderwidth=2)
btn_cerrar.grid(row=0, column=2, padx=10)

# Redondear botones
btn_iniciar.configure(borderwidth=0, highlightthickness=0)
btn_iniciar.config(highlightbackground="#00D100", highlightcolor="#00D100", relief="groove")
btn_iniciar.config(borderwidth=0, highlightbackground="#00D100", highlightthickness=2)

btn_cerrar.configure(borderwidth=0, highlightthickness=0)
btn_cerrar.config(highlightbackground="#FF4040", highlightcolor="#FF4040", relief="groove")
btn_cerrar.config(borderwidth=0, highlightbackground="#FF4040", highlightthickness=2)

# Ejecutar la aplicación
root.mainloop()