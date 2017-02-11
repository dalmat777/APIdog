[APIdog v6.5] (https://apidog.ru/6.5/about.php)
===========

Альтернативный веб-клиент для социальной сети ВКонтакте, который работает исключительно на API ВКонтакте.

Клиентская часть
----------------
Клиентский код расположен в папках js/ и css/.
Сборка кода в данный момент не предусмотрено.

Серверная часть
---------------
### PHP
Расположен в корне проекта.
* `zero.authorize.php`: работа с авторизацией ВК
* `zero.db.php`: работа с БД сайта (что-то типа фреймворк). Используется для настроек и прочего.
* `api-v2.php`: внутреннее API сайта
* `zero.errors.php`: описание ошибок для API
* `zero.framework.php`: *пока что каша из непонятного кода*
* `zero.helper.php`: "ядро" и модели
* `zero.language.php`: работа с языковыми данными
* `zero.pageutilites.php`: работа с выводом страницы
* `zero.paid.php`: работа с платными услугами
* `zero.userarea.php`: работа с пользователями и их модели (сессии и прочее)

Отсутствует файл zero.config.php. Вы должны создать его сами, вписав и заполнив следующие строки:
```php
<?
	define("dbHost", "___");
	define("dbUser", "___");
	define("dbPassword", "___");
	define("dbDatabase", "___");
	define("_install", true);
?>
```

### NodeJS
Работа с LongPoll: один файл `longpoll.js`

Расширение APIdog Plus
----------------------
Также доступно на GitHub по адресу: https://github.com/vladislav805/APIdogPlusExtension
С янврая 2017 года только одно единое. До этого было разделение на расширение для Firefox/Chrome+Opera



Команда проекта:
========
* Велюга Владислав (разработчик)
* Антон Карпович (финансовый директор)
* Александр Ткачук (системный администратор)
* Тарас Дацюк (техподдержка)
* Илья Ворчук (дизайнер)
* Оксана Эриксон (агент поддержки)
* Надя Иванова (агент поддержки)


Подробная информация по проекте [здесь] (http://apidog.ru/6.5/about.php).
