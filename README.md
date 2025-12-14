# Take home for HBC

This repo contains the take home assignment for Michael Hollander's HBC interview. 

# Contents

This contains two main folders: Back and front. Back is a C# backend and front is a react front end. 

## Design philosophy

I tried to adhere to proper design principles and clear code wherever possible even when it would make for more code. I figured that you wanted to see how I might think to structure a larger project than this.


## AI Use
I used AI a bit more than I had intended to because I didn't want to cut corners with the design. I want to be clear about how I used it and why, because I know you wanted to discourage its use on this take home.

On the C# side, I wrote all the code by hand but I did ask AI for some clarification regarding best practices. At my previous job we had our own ORM / reactive distribution infrastructure. I was used to taking certain shortcuts, and so I wanted to be clear about separation of concerns. I wrote this code to be as specific as possible with types and to separate entity types from types used for data transfer to and from the client. I also used AI to write a test harness for the C# backend so that I could easily test it before writing the React front end.

On the React side I did use it more. Partially I wanted to get the details of data transfer on subscribe over the web socket correct (start listening first / queue events / get initial state / apply events; handle reconnect) - I thought that was the most important thing to get right, and given the time involved I used AI as a sounding board on this. Additionally I didn't see much value in me doing the web page design and HTML layout on this project; that would actually have taken me quite a bit of time to do right. Additionally, I really haven't written that much React - I've written a lot of UIs using WPF, and so I used AI as a crutch here probably more than you would like. I read the code closely and can explain / defend any of the choices though.

Thanks for reading!
Michael

