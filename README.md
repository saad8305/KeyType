# KeyType
KeyType is a web app to test and practice on your typing with keyboard to make yourself faster(like Monkey Type)
# ============================================
# How to use this project ?
# 1.install packages in requirements.txt.
# 2.install node and npm defualt packages.
# 3.use directory in the below to set the files : 
# -------------------------------------------
|client---public
      |---src------components------TypingBox------TypingBox.jsx
                                           |------TypingBox.module.css
                            |------ShareResult.jsx
            |------contextx------ThemeContext.jsx
            |------pages------Home.jsx
                       |------LeaderBoard.jsx
                       |------Login.jsx
                       |------Profile.jsx
                       |------Race.jsx
                       |------Register.jsx
                       |------Settings.jsx
            |------services------api.js
            |------store------authStore.js
                       |------gameStore.js
            |------utils------sounds.js
            |------App.css
            |------App.jsx
            |------index.css
            |------main.jsx
      |---index.html
      |---README.md
      |---vite.config.js
      
|database
|server------app------middlewere------__init__.py
                               |------auth.py
               |------models------__init__.py
                           |------game_results.py
                           |------text.py
                           |------user.py
               |------routes------__init__.py
                           |------auth.py
                           |------game.py
                           |------leaderboard.py
                           |------user.py
               |------services------__init__.py
                             |------text_generator.py
               |------sockets-------race_events.py
               |------utils------__init__.py
                          |------jwt_handler.py
                          |------password.py
               |------__init__.py
               |------config.py
               |------extensions.py
      |------intance
      |------.env
      |------.flaskenv
      |------create_db_simple.py
      |------requirements.txt
      |------run.py
      |------seed_texts.py
# -----------------------------------------
