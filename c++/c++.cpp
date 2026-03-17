#include <WiFi.h>
#include <HTTPClient.h>

const char* ssid = "የWi-Fi_ስም";
const char* password = "የWi-Fi_ፓስዎርድ";

// የኮምፒውተርህ IP አድራሻ (ለምሳሌ 192.168.1.5)
const char* serverName = "http://192.168.1.5:3000/update-level";

const int trigPin = 5;
const int echoPin = 18;

void setup() {
  Serial.begin(115200);
  pinMode(trigPin, OUTPUT);
  pinMode(echoPin, INPUT);

  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.println("ከWi-Fi ጋር እየተገናኘሁ ነው...");
  }
  Serial.println("ተገናኝቷል!");
}

void loop() {
  // 1. ርቀቱን መለካት
  long duration;
  float distance;
  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);
  
  duration = pulseIn(echoPin, HIGH);
  distance = (duration * 0.034) / 2; // ወደ ሴንቲሜትር መቀየር

  // 2. ርቀቱን ወደ ፐርሰንት መቀየር (ለምሳሌ የታንከሩ ቁመት 100 ሳ.ሜ ቢሆን)
  int waterPercent = map(distance, 100, 0, 0, 100); 
  if(waterPercent > 100) waterPercent = 100;
  if(waterPercent < 0) waterPercent = 0;

  // 3. ወደ ሰርቨር መላክ
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    String url = String(serverName) + "?level=" + String(waterPercent);
    http.begin(url);
    int httpResponseCode = http.GET();
    
    if (httpResponseCode > 0) {
      Serial.print("ዳታ ተልኳል! Response: ");
      Serial.println(httpResponseCode);
    }
    http.end();
  }
  
  delay(5000); // በየ 5 ሰከንዱ ይለካል
}