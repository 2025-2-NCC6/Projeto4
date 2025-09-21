#include <Adafruit_LiquidCrystal.h> 

#include <Keypad.h> 

char senha [6] = {'1', 'A', '2', 'B', '3', 'C'}; //senha padrão
char entrada[6];
int pos = 0;
int ledVermelho = 3; //led vermelho
int ledVerde = 4; // led verde
Adafruit_LiquidCrystal tela(0); // tela LCD

const byte Linhas= 4; /
const byte Colunas= 4; 

//definindo teclas por linhas e colunas
char matrizTeclado[Linhas][Colunas]= 
{
{'1', '2', '3', 'A'}, 
{'4', '5', '6', 'B'}, 
{'7', '8', '9', 'C'},
{'*', '0', '#', 'D'}
};

byte pinosLinhas[Linhas] = {12,11,10,9}; 
byte pinosColunas[Colunas]= {8,7,6,5}; 

//inicializando o teclado como Keypad
Keypad teclado= Keypad(makeKeymap(matrizTeclado), pinosLinhas,
                       pinosColunas, Linhas, Colunas);

void setup() {
  tela.begin(16, 2);
  tela.print("Senha:");
  tela.setBacklight(1);
  
  pinMode(ledVermelho, OUTPUT);
  pinMode(ledVerde, OUTPUT);
  
  digitalWrite(ledVermelho, HIGH);
  Serial.begin(9600);
}

void loop() {
  char tecla = teclado.getKey();
  
  if (tecla != NO_KEY) {
    Serial.println(tecla);
    tela.setCursor(pos,1);
    tela.print("*");
    
    entrada[pos] = tecla;
    pos++;
    
    if (pos == 6) {
      verificarSenha();
      pos = 0;
      tela.clear();
      tela.print("Senha:");
    }
  }
}

void verificarSenha() {
  bool correta = true;
  for (int i = 0; i < 6; i++) {
    if (entrada[i] != senha[i]) {
      correta = false;
      break;
    }
  }
  
  if (correta) {
    liberado();  
  } else {
    negado();
  }
}

void liberado() {
  tela.clear();
  tela.print("Acesso Liberado!");
  digitalWrite(ledVermelho, LOW);
  for (int x = 0; x < 5; x++) {
    digitalWrite(ledVerde, HIGH);
    delay(100);
    digitalWrite(ledVerde, LOW);
    delay(100);
  }
}

void negado() {
  tela.clear();
  tela.print("Acesso Negado!");
  for (int i = 0; i < 5; i++) {
    digitalWrite(ledVermelho, HIGH);
    delay(100);
    digitalWrite(ledVermelho, LOW);
    delay(100);
  }
  digitalWrite(ledVermelho, HIGH);
}