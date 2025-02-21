const axios = require("axios");
require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");
const bot = new TelegramBot(process.env.token, { polling: true });
function sendMessage(data) {
  const weather = data.current;
  const location = data.location;

  const message =
    `🌍 *Location:* ${location.name}, ${location.country}\n` +
    `🌡 *Temperature:* ${weather.temp_c}°C\n` +
    `☁ *Condition:* ${weather.condition.text}\n` +
    `💨 *Wind Speed:* ${weather.wind_kph} km/h\n` +
    `💧 *Humidity:* ${weather.humidity}%`;

  return message;
}
async function fetchWeather(location) {
  try {
    const response = await axios.get(
      "http://api.weatherapi.com/v1/current.json",
      {
        params: {
          key: process.env.WEATHER_API,
          q: location,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error fetching weather", error.message);
    return null;
  }
}

// --------------------- MENU ---------------------
bot.setMyCommands([
  { command: "start", description: "Start the bot and get a welcome message" },
  { command: "help", description: "Get instructions on how to use the bot" },
  { command: "weather", description: "Get the current weather for a city" },
]);

// Commands
bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  if (!msg.text) return;
  const text = msg.text.trim();

  if (text.toLowerCase() === "/start") {
    bot.sendMessage(
      chatId,
      "🌤 *Welcome to Weather Bot* \n\nType `/weather cityName` to get the weather\\.",
      { parse_mode: "HTML" }
    );
  } else if (text.toLowerCase() === "/help") {
    bot.sendMessage(
      chatId,
      "ℹ *How to use the bot:* \n\n" +
        "1️⃣ Use `/weather cityName` to get weather details\\. \n" +
        "2️⃣ Example: `/weather Mumbai` \n" +
        "3️⃣ You will get temperature, wind speed, and humidity\\. ",
      { parse_mode: "HTML" }
    );
  } else if (text.toLowerCase().startsWith("/weather")) {
    const args = text.split(" ");
    if (args.length < 2) {
      bot.sendMessage(
        chatId,
        "Please share your location or enter a city name:",
        {
          reply_markup: {
            keyboard: [[{ text: "Send location", request_location: true }]],
            resize_keyboard: true,
            one_time_keyboard: true,
          },
        }
      );
    } else {
      const cityName = args.slice(1).join(" ");
      const data = await fetchWeather(cityName);

      if (!data) {
        bot.sendMessage(
          chatId,
          `❌ *Weather data not found for:* ${cityName}\n\nPlease enter a valid city name\\.`,
          { parse_mode: "HTML" }
        );
        return;
      }

      const weather = data.current;
      const location = data.location;
      const message =
        `🌍 *Location:* ${location.name}, ${location.country}\n` +
        `🌡 *Temperature:* ${weather.temp_c}°C\n` +
        `☁ *Condition:* ${weather.condition.text}\n` +
        `💨 *Wind Speed:* ${weather.wind_speed} km/h\n` +
        `💧 *Humidity:* ${weather.humidity}%`;

      bot.sendMessage(chatId, message, { parse_mode: "HTML" });
    }
  }
});

//handling location message
bot.on("location", async (msg) => {
  const chatId = msg.chat.id;
  const { latitude, longitude } = msg.location;

  try {
    const response = await axios.get(
      "http://api.weatherapi.com/v1/current.json",
      {
        params: {
          key: WEATHER_API,
          q: `${latitude}, ${longitude}`,
        },
      }
    );

    const data = response.data;
    const weather = data.current;
    const location = data.location;

    const message =
      `🌍 *Location:* ${location.name}, ${location.country}\n` +
      `🌡 *Temperature:* ${weather.temp_c}°C\n` +
      `☁ *Condition:* ${weather.condition.text}\n` +
      `💨 *Wind Speed:* ${weather.wind_kph} km/h\n` +
      `💧 *Humidity:* ${weather.humidity}%`;

    bot.sendMessage(chatId, message, { parse_mode: "HTML" });
  } catch (error) {
    console.error("Error fetching weather", error.message);
    bot.sendMessage(
      chatId,
      "❌ Failed to fetch weather data\\. Please try again\\."
    );
  }
});
