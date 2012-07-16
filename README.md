#WebSocket test tool

This is a tool to test you socket application, Its configured to run on SocketStream but can with a very small effort be edited to run on different frameworks. It works by letting you create multiple instances of an headless Webkit browser Phantomjs and in every instance you can create multiple connections. 

It lets you pre define what functions you want to run on every connections when it has finished creating them all. 

You have a number of settings you can configurator before you run the test.

The goal of this tool is to help you test how your websocket applications stands under different amount of presser.

### How to install it.

1 I use Phantomjs as the headless webkit browser so you will have to install it, Instructions on how to install it can be found [here](http://code.google.com/p/phantomjs/wiki/Installation).

2 I use node for some of the data analysis so you will have to have node installed, Instructions on how to install it can be found [here](http://nodejs.org/#download).

3 Download this project from Github.

4 Place the files in a good location in your computer.

5. cd in to the directions where you placed the downloaded files.

6. Make the bash script executable by running " chmod 711 LoadTest.sh " this make you able to run the bash script.

7. Run the test by calling ./LoadTest.sh URL connections clients example "./LoadTest.sh http://localhost:8000 10 10"

8. You will see an output in the terminal that are explaining what are going on right now in the test run.

9. When the test is completed the tool will open a html file in your default browser that has a summery of data collected during testing. 

### How to edit settings. 

So this tool have some settings that you can control, Fist of in the settings.json you can in json define what function should run on the sockets with what data and how may times, You can define multiple functions to run.

When you download this tool it is configured to test SocketStream applications, But it contains some examples on how to run it on some other frameworks and you can easily add the framework you want to test. 

#### How to edit/add frameworks.

So to edit /add frameworks you will have to go in to the ph.js file and do a search for "Edit/Add frameworks" this will bring you to the start of the code you have to edit, In here you can find a number of examples, If you find the framework you are looking for just on comment it and comment out the framework that was active before. If you cant find the framework you are looking for comment out all the existing ones and write your own. 

Some thinks to think about when creating new ones are that the code will be executed in the sandbox of this connection, so you have to make it a string to be able to use the data from the settings.json file. 

The client will have to have all the libraries, functions and objects that you are using in your function. Provide a function that will be called when the socket call has returned and make it do callPhantom(data, ' + t + ') where data is the value return on the socket and t is the time from ph.js variable, I am using the t to count the time it takes for the socket to return. 


### Some tips on how to use it. 

During developing I have bin testing the tool towards a SocketStream application. I have found that is nice to have the server log up during the run here you will see when thinks starts to break, Its also nice to look at the top command or similar to see the load on the server.