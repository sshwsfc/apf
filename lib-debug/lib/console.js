require(["envdetect"], function(env){
    define([env.isNode
      ? "lib-debug/console/cli"
      : "lib-debug/console/browser"], function(console){
        return console;
    });
});