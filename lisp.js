// File: lisp.js
//                        
// Author: Paul M. Parks
// 
// Purpose: 
// An implementation of Lisp in JavaScript.
// 
// Comments: 
//
// Greenspun's Tenth Rule of Programming: "Any sufficiently complicated
// C or Fortran program contains an ad-hoc, informally-specified
// bug-ridden slow implementation of half of Common Lisp."
//
// I suppose we can add JavaScript to that list, now.
// 
// Contact:
// 
// paul@parkscomputing.com
// http://www.parkscomputing.com/
// 
// License:
// 
// Copyright (c) 2005, Paul M. Parks
// All Rights Reserved.
// 
// Redistribution and use in source and binary forms, with or without 
// modification, are permitted provided that the following conditions 
// are met:
// 
// * Redistributions of source code must retain the above copyright 
//   notice, this list of conditions and the following disclaimer.
// 
// * Redistributions in binary form must reproduce the above 
//   copyright notice, this list of conditions and the following 
//   disclaimer in the documentation and/or other materials provided 
//   with the distribution.
// 
// * Neither the name of Paul M. Parks nor the names of his 
//   contributors may be used to endorse or promote products derived 
//   from this software without specific prior written permission.
// 
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS 
// "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT 
// LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS 
// FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE 
// COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, 
// INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, 
// BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; 
// LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER 
// CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT 
// LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN 
// ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF 
// THE POSSIBILITY OF SUCH DAMAGE.
//


var Lisp = new Object();


Lisp.showSource = function() {};
Lisp.debug = function(str) {};
Lisp.oneval = function(value) {};


Lisp.functions = new Object();

this["apropos"] = new function()
{
};

this["apropos"].__documentation = "Display a list of symbols that are a partial match to the provided string.";


this["apropos"].entries = new Object();


this["t"] = this["T"] = true;

// Oh, my, what a horrible attempt at case-insensivity. Shoot me.
this["nil"] = this["Nil"] = this["nIl"] = this["NIl"] =
this["niL"] = this["NiL"] = this["nIL"] = this["NIL"] = new Array();

// Sorry, functions are all-caps. I'm not committing the above
// crime for everything. The evaluation engine will convert to
// all-caps before calling the functions.
this["eq"] = this["="] = function()
{
   return (arguments[0] == arguments[1]) ? T : NIL;
};

this["eq"].__documentation = "Return T if parameters are equal, NIL otherwise.";


this["null"] = function(param)
{
   return (param.length != undefined && param.length == 0);
};

this["null"].__documentation = "Return T if the parameter is NIL, or ()";


this["symbolp"] = function(param)
{
   var ret = this[param];
   var context = this;
   
   while (ret == undefined && context.parent && context.parent !== this)
   {
      context = context.parent;
      ret = context[param];
   }
   
   return ret != undefined ? T : NIL;
};


this["not"] = function()
{
   return (arguments[0] == NIL || arguments[0].length != undefined && arguments[0].length == 0) ? T : NIL;
};

this["not"].__documentation = "Return the negation of the parameter.";


this["cond"] = function()
{
   var ret = NIL;
   
   for (var i = 0; i < arguments.length; ++i)
   {
      var ix = 0;
      var cond = arguments[i][ix];
      
      if (typeof cond == "object" && cond.length)
      {
         cond = Lisp.eval.call(this, cond);
      }
      else
      {
         if (cond == "'")
         {
            ++ix;
            cond = arguments[i][ix];
         }
         else
         {
            cond = Lisp.eval.call(this, cond);
         }
      }

      if (cond != NIL)
      {
         var ret = cond;
         
         ++ix;

         while (ix < arguments[i].length)
         {
            ret = arguments[i][ix];
            
            if (typeof ret == "object" && ret.length)
            {
               ret = Lisp.eval.call(this, ret);
            }
            else if (typeof ret == "string")
            {
               if (ret == "'")
               {
                  ++ix;
                  ret = arguments[i][ix];
               }
               else
               {
                  ret = Lisp.eval.call(this, ret);
               }
            }
            
            ++ix;
         }

         return ret;
      }
   }

   return NIL;
};


this["and"] = function()
{
   for (var i = 0; i < arguments.length; ++i)
   {
      var cond = arguments[i];
      
      if (typeof cond == "object" && cond.length)
      {
         cond = Lisp.eval.call(this, cond);
      }
      else 
      {
         if (cond == "'")
         {
            ++i;
            cond = arguments[i];
         }
         else
         {
            cond = Lisp.eval.call(this, cond);
         }
      }

      if (Lisp.global["not"].call(this, cond) != NIL)
      {
         return cond;
      }
   }

   return cond;
};

this["if"] = this["cond"];
this["or"] = function()
{
   var ret = NIL;

   for (var i = 0; i < arguments.length; ++i)
   {
      var cond = arguments[i];
      
      if (typeof cond == "object" && cond.length)
      {
         cond = Lisp.eval.call(this, cond);
      }
      else
      {
         if (cond == "'")
         {
            ++i;
            cond = arguments[i];
         }
         else
         {
            cond = Lisp.eval.call(this, cond);
         }
      }

      if (cond != NIL)
      {
         return cond;
      }
   }

   return NIL;
};


this[">"] = function()
{
   return (arguments[0] > arguments[1]) ? T : NIL;
};


this["<"] = function()
{
   return (arguments[0] < arguments[1]) ? T : NIL;
};


this["+"] = function()
{
   var ret = arguments[0];
   
   for (var i = 1; i < arguments.length; ++i)
   {
      ret += arguments[i];
   }

   return ret;
};

this["%"] = function()
{
   var ret = arguments[0];
   while(ret < 0) { ret = ret + 4; }
   for (var i = 1; i < arguments.length; ++i)
   {
      ret = ret % arguments[i];
   }

   return ret;
}


this["-"] = function()
{
   var ret = arguments[0];
   
   for (var i = 1; i < arguments.length; ++i)
   {
      ret -= arguments[i];
   }

   return ret;
};


this["*"] = function(context)
{
   var ret = arguments[0];
   
   for (var i = 1; i < arguments.length; ++i)
   {
      ret *= arguments[i];
   }

   return ret;
};


this["/"] = function()
{
   var ret = arguments[0];
   
   for (var i = 1; i < arguments.length; ++i)
   {
      ret /= arguments[i];
   }

   return ret;
};


this["print"] = function()
{
   Lisp.onprint && Lisp.onprint(arguments[0]);
   
   return arguments[0];
};


this["quote"] = this["'"] = function()
{
   return arguments[0];
};


// backquote
this["`"] = function()
{
   var obj = arguments[0];
   var retobj = obj;
   
   if (typeof obj == "object" && obj.length != undefined)
   {
      retobj = new Array();
      var i = 0;
      var r = 0;
      
      while (i < obj.length)
      {
         retobj[r] = obj[i];
         
         if (typeof obj[i] == "object" && obj[i].length != undefined)
         {
            retobj[r] = Lisp.global["'"].call(this, obj[i]);
         }
         else
         {
            if (obj[i] == "'")
            {
               ++i;
               ++r;
               retobj[r] = obj[i];
            }
            
            if (obj[i] == ",")
            {
               ++i;
               retobj[r] = Lisp.eval.call(this, obj[i]);
            }
         }

         ++i;
         ++r;
      }
   }
   
   return retobj;
};


this["setq"] = function()
{
   var value = NIL;

   if (arguments[1] == "'")
   {
      value = arguments[2];
   }
   else
   {
      value = Lisp.eval.call(this, arguments[1]);
   }
   
   var context = this;
   var atom = context[arguments[0]];
   var setp = false;
   
   while (atom == undefined && context.parent && context.parent !== context)
   {
      context = context.parent;
      
      if (context[arguments[0]] != undefined)
      {
         context[arguments[0]] = value;
         setp = true;
      }
   }

   if (!setp)
   {
      this[arguments[0]] = value;
   }
   
   return obj = value;
};


this["setf"] = function()
{
   return Lisp.global.setq.call(this, arguments);
   /*
   var ret = NIL;

   if (arguments[1] == "'")
   {
      ret = arguments[2];
   }
   else
   {
      ret = Lisp.eval.call(this, arguments[1]);
   }
   
   this[arguments[0]] = ret;
   return ret;
   */
}


this["make-hash-table"] = function()
{
   return new Object();
};


this["gethash"] = function()
{
   var hashtable = arguments[1];
   var entry = arguments[0];

   if (hashtable[entry] == undefined)
   {
      hashtable[entry] = new Array();
   }

   return hashtable[entry];
};


this["sethash"] = function()
{
   var hashtable = arguments[1];
   var entry = arguments[0];

   return hashtable[entry] = arguments[2];
};


this["domget"] = function()
{
   if (arguments.length)
   {
      var list = arguments[0];
      var ret = Lisp.eval.call(this, list[0]);
   
      for (var i = 1; i < list.length; ++i)
      {
         ret = ret[list[i]];
      }
      
      return ret;
   }
   
   return NIL;
};

// (domset '(object objectChild childChild) value)
// (domset object value)

this["domset"] = function()
{
   if (arguments.length)
   {
      var list = arguments[0];
      var value = arguments[1];
      var obj = list;
      
      if (list.length != undefined)
      {
         obj = Lisp.eval.call(this, list[0]);
         
         if (list.length)
         {
            var i = 1;

            while (i < list.length - 1)
            {
               obj = obj[list[i]];
               ++i;
            }
            
            obj[list[i]] = (value == NIL) ? false : value; 
         }
         else
         {
            obj = (value == NIL) ? false : value;
         }
      }
      else
      {
         obj = (value == NIL) ? false : value;
      }
      
      return value;
   }
   
   return NIL;
};

// (domcall '(document createElement) "a")
this["domcall"] = function()
{
   if (arguments.length)
   {
      var list = arguments[0];
      
      var call = list[0];

      if (this[call])
      {
         call = "this['" + call + "']";
      }
   
      for (var i = 1; i < list.length; ++i)
      {
         call = call + "." + list[i];
      }
      
      var args = "(";
      i = 1;
      var objs = new Object();
      var obji = 0;
      
      while (i < arguments.length)
      {
         if (typeof arguments[i] == "string")
         {
            args += '"' + arguments[i] + '"';
         }
         /*
         else if (arguments[i].length)
         {
            args += '[' + arguments[i] + ']';
         }
         */
         else if (typeof arguments[i] == "object")
         {         
            objs[obji] = arguments[i] == NIL ? false : arguments[i];
            args += "objs[" + obji + "]";
            ++obji;
         }
         else
         {
            args += arguments[i];
         }
         
         ++i;
         
         if (i < arguments.length)
         {
            args += ", ";
         }
      }
      
      args += ")";
      
      call = call + args;
      var ret = eval.call(this, call);
      return ret;
   }
   
   return NIL;
};


this["let"] = function()
{
   var ret = NIL;
   var local = new Array();
   var bindings = arguments[0];
  
   for (var i = 0; i < bindings.length; ++i)
   {
      var x = bindings[i][0];
      var y = bindings[i][1];
      
      if (typeof y == "object" && y.length)
      {
         y = Lisp.eval.call(this, y);
      }
      else if (typeof y == "string")
      {
         if (y == "'")
         {
            y = bindings[i][2];
         }
         else
         {
            y = Lisp.eval.call(this, y);
         }
      }
      
      local[x] = y;
   }
   
   local.parent = this;
   
   i = 1;

   while (i < arguments.length)
   {
      ret = arguments[i];
      
      if (typeof ret == "object" && ret.length)
      {
         ret = Lisp.eval.call(local, ret);
      }
      else if (typeof ret == "string")
      {
         if (ret == "'")
         {
            ++i;
            ret = arguments[i];
         }
         else
         {
            var context = this;
            var atom = context[ret];
            var x = 0;
            
            while (atom == undefined && context.parent && context.parent !== context)
            {
               context = context.parent;
               atom = context[ret];
            }
            
            ret = atom;
         }
      }
      
      ++i;
   }

   return ret;
};


this["return"] = function()
{
   var ret = arguments[0];
   this["__retval"] = ret;
   return ret;
};


this["#eval"] = function()
{
   return Lisp.eval.apply(this, arguments);
};


this["loop"] = function()
{
   var local = new Object();
   local.parent = this;
   
   while (true)
   {
      var i = 0;
      
      while (i < arguments.length)
      {
         ret = Lisp.eval.call(local, arguments[i]);
         
         if (local["__retval"]) 
         {
            return ret;
         }
         
         ++i;
      }
   }   
   
   return NIL;
};


this["dotimes"] = function(arglist)
{
   var local = new Object();
   local.parent = this;
   var __exitcond = Lisp.eval.call(local, arglist[1]);
   var __j = 1;
   
   for (local[arglist[0]] = 0; local[arglist[0]] < __exitcond; ++local[arglist[0]])
   {
      __j = 1;
      
      while (__j < arguments.length)
      {
         ret = Lisp.eval.call(local, arguments[__j]);
         
         if (local["__retval"]) 
         {
            return ret;
         }
         
         ++__j;
      }
   }   
   
   return (arglist[2] != undefined) ? Lisp.eval.call(local, arglist[2]) : NIL;
};


this["dolist"] = function(arglist)
{
   var local = new Object();
   local.parent = this;
   var __valuelist = NIL;
   var __retpos = 2;
   
   if (arglist[1] == "'")
   {
      // __valuelist = arglist[2];
      __valuelist = Lisp.global["'"].call(local, arglist[2]);
      ++__retpos;
   }
   else if (arglist[1] == "`")
   {
      __valuelist = Lisp.global["`"].call(local, arglist[2]);
      ++__retpos;
   }
   else
   {
      __valuelist = Lisp.eval.call(local, arglist[1]);
   }
   
   var __exitcond = __valuelist.length;
   // alert(__valuelist);
   // alert(__exitcond);
   var __j = 1;
   
   for (var __i = 0; __i < __exitcond; ++__i)
   {
      local[arglist[0]] = __valuelist[__i];
      __j = 1;
      
      while (__j < arguments.length)
      {
         ret = Lisp.eval.call(local, arguments[__j]);
         
         if (local["__retval"]) 
         {
            return ret;
         }
         
         ++__j;
      }
   }   
   
   return (arglist[__retpos] != undefined) ? Lisp.eval.call(local, arglist[__retpos]) : NIL;
};


/*
this["defun"] = function()
{
   // arguments[0] = arguments[0].toUpperCase();
   return Lisp.global["defun-keep-case"].apply(this, arguments);
};


this["defun-keep-case"] = function()
{
   var fnName = arguments[0];

   var i = 1;
   var args = new Array();
   
   while (i < arguments.length)
   {
      args.push(arguments[i]);
      ++i;
   }

   Lisp.global[fnName] = Lisp.global["lambda"].apply(this, args);

   if (typeof arguments[3] == "string")
   {
      Lisp.global[fnName].__documentation = arguments[3];
   }
   
   return fnName;
};
*/

function defun()
{
   var fnName = arguments[0];

   var i = 1;
   var args = new Array();
   
   while (i < arguments.length)
   {
      args.push(arguments[i]);
      ++i;
   }

   Lisp.global[fnName] = Lisp.global["lambda"].apply(this, args);

   if (typeof arguments[3] == "string")
   {
      Lisp.global[fnName].__documentation = arguments[3];
   }
   
   return fnName;
};

this["lambda"] = function()
{
   var i = 0;
   var parmList = arguments[0];
   var ins = arguments;
   var parent = this;
   var vars = "var local = new Object(); local.parent = parent; ";
   var varUpdate = "";

   var ret = null;

   var body = "ret = function(";
   
   while ( i < parmList.length)
   {
      body += parmList[i];
      vars += " local['" + parmList[i] + "'] = " + parmList[i] + "; ";
      varUpdate += parmList[i] + " = local['" + parmList[i] + "']; ";
      ++i;
      
      if (i < parmList.length)
      {
         body += ", ";
      }
   }
   
   body += ") {" + vars + 'var ret=null;var i=1;while(i<ins.length){ret=Lisp.eval.call(local, ins[i]);if(local["__retval"]){break;}++i;}return ret;}';

   return eval(body);
};

this["lambda"].__documentation = "Creates an anonymous function";


this["documentation"] = function()
{
   var ret = NIL;
   
   if (eval("this." + arguments[0].toUpperCase() + ".__documentation") != undefined)
   {
      ret = eval("this." + arguments[0].toUpperCase() + ".__documentation");
   }
   
   Lisp.global.print(ret);
   return ret;
};


this["defmacro"] = function()
{
   var i = 0;
   var fnName = arguments[0];
   var parmList = arguments[1];
   var ins = arguments;
   var parent = this;
   var vars = "var local = new Object(); local.parent = parent; ";
   var varUpdate = "";

   var ret = null;

   var body = "ret = function(";
   
   while ( i < parmList.length)
   {
      body += parmList[i];
      vars += " local['" + parmList[i] + "'] = " + parmList[i] + "; ";
      varUpdate += parmList[i] + " = local['" + parmList[i] + "']; ";
      ++i;
      
      if (i < parmList.length)
      {
         body += ", ";
      }
   }
   
   function evalSubst()
   {
      var i = 2;
      var r = 0;
      
      var retobj = new Array();
      
      while (i < ins.length)
      {
         if (ins[i] == "`")
         {
            ++i;
            retobj[r] = Lisp.global["`"].call(this, ins[i]);
         }
         else if (ins[i] == "'")
         {
            ++i;
            retobj[r] = Lisp.global["'"].call(this, ins[i]);
         }
         else
         {
            retobj[r] = Lisp.eval.call(this, ins[i]);
         }
         
         ++i;
         ++r;
      }

      return retobj;
   }
   
   body += ") {" + vars + 'var ret=null;var i=0;var forms=evalSubst.call(local);while(i<forms.length){ret=Lisp.eval.call(local, forms[i]);if(local["__retval"]){break;}++i;}return ret;}';

   return this[fnName] = eval(body);
};


this["cons"] = function()
{
   var val = arguments[1];
   var ret = new Array();
   
   ret.push(arguments[0]);
      
   if (val != NIL)
   {
      if (typeof val == "object")
      {
         for (var i in val)
         {
            ret.push(val[i]);
         }
      }
      else
      {
         ret.push(NIL);
         ret.push(val);
      }
   }
      
   return ret;
};


this["list"] = function()
{
   var ret = new Array();
   
   var i = 0;
   
   while (i < arguments.length)
   {
      ret.push(arguments[i]);
      ++i;
   }
   
   return ret;
};


this["car"] = function(list)
{
   if (list.length != undefined && list.length)
   {
      return list[0];
   }
   else
   {
      return list;
   }  
};


this["cdr"] = function(list)
{
   return list.slice(1);
};


this["atom"] = function(param)
{
   var ret = NIL;
   
   if (typeof param != "object")
   {
      ret = T;
   }
   else if (param.length == undefined) // This might not be enough
   {
      ret = T;
   }

   return ret;
};


this["consp"] = function(param)
{
   if (param == Lisp.global["NIL"])
   {
      return T;
   }
   
   return Lisp.global["listp"].call(this, param);
};


this["listp"] = function(param)
{
   var ret = Lisp.global["atom"].call(this, param);
   return ret == T ? Lisp.global["NIL"] : T;
};


Lisp.specialForms = new Object();

Lisp.specialForms["setq"] = true;
Lisp.specialForms["let"] = true;
Lisp.specialForms["let*"] = true;
Lisp.specialForms["cond"] = true;
Lisp.specialForms["quote"] = true;
Lisp.specialForms["defun"] = true;
Lisp.specialForms["defun-keep-case"] = true;
Lisp.specialForms["lambda"] = true;
Lisp.specialForms["defmacro"] = true;
Lisp.specialForms["progn"] = true;
Lisp.specialForms["progv"] = true;
Lisp.specialForms["if"] = true;
Lisp.specialForms["loop"] = true;
Lisp.specialForms["dotimes"] = true;
Lisp.specialForms["dolist"] = true;
Lisp.specialForms["and"] = true;
Lisp.specialForms["or"] = true;


// Lisp.interpret = function(str)
function interpret(str)
{
   var ret = null;
   var list = new Array();

   Lisp.tokenize(str, 0, list);
   
   for (var i = 0; i < list.length; ++i)
   {
      if (list[i] == "`")
      {
         ++i;
         ret = Lisp.global["`"].call(Lisp.global, list[i]);
      }
      else if (list[i] == "'")
      {
         ++i;
         ret = Lisp.global["'"].call(Lisp.global, list[i]);
      }
      else
      {
         ret = Lisp.eval.call(Lisp.global, list[i]);
      }
   }
   
   return ret;
};


Lisp.tokenize = function(str, i, list)
{
   var ix = 0;
   var comment = false;
   var string = false;
   var c = null;

   var tokStart = i;

   function getToken()
   {
      var token = null;
      var n = 0;
      
      if (tokStart < i)
      {
         token = str.substring(tokStart, i);

         n = parseFloat(token);

         if (isNaN(n))
         {
            list[ix++] = token;
         }
         else
         {
            list[ix++] = n;
         }
      }
   };
   
   var fn = new Object();
   
   fn["("] = function() 
   {
      getToken();
      list[ix] = new Array();
      ++i;
      i = Lisp.tokenize(str, i, list[ix]);
      ++ix;
      tokStart = i;
      return false;
   };
   
   fn[")"] = function() 
   {
      getToken();
      ++i;
      return i;
   };
   
   fn[";"] = function() 
   {
      comment = true;
      ++i;
      tokStart = i;
      return false;
   };
   
   fn["\""] = function() 
   {
      list[ix++] = "'";
      string = true;
      ++i;
      tokStart = i;
      return false;
   };
   
   fn["'"] = fn["`"] = fn[","] = function() 
   {
      list[ix++] = str.charAt(i);
      ++i;
      tokStart = i;
      return false;
   };
   
   fn[" "] = fn["\t"] = fn["\r"] = fn["\n"] = function() 
   {
      getToken();
      ++i;
      tokStart = i;
      return false;
   };
   

   while (i < str.length)
   {
      c = str.charAt(i);

      Lisp.showSource(c);

      if (comment)
      {
         if (c == "\r" || c == "\n")
         {
            comment = false;
         }
         
         ++i;
         tokStart = i;
      }
      else if (string)
      {
         if (c == "\"")
         {
            string = false;
            getToken();
            ++i;
            tokStart = i;
         }
         else
         {
            ++i;
         }
      }
      else
      {
         if (fn[c])
         {
            var ret = fn[c]();
            
            if (ret)
            {
               return ret;
            }
         }
         else
         {
            ++i;
         }
      }
   }
   
   getToken();
   return i;
};


Lisp.global = this;


Lisp.eval = function(list, listp)
{
   var ret = null;
   var fnName = null;
   var fn = null;
   
   if (typeof list == "object" && list.length != undefined)
   {
      if (typeof list[0] == "string")
      {
         fnName = list[0]; //.toUpperCase();

         var context = Lisp.global;
         fn = context[fnName];

         /*
         if (fn == undefined)
         {
            fn = context[list[0]];
         }
         */
         
         while (fn == undefined && context.parent && context.parent !== context)
         {
            context = context.parent;
            fn = context[fnName];

            /*
            if (fn == undefined)
            {
               fn = context[list[0]];
            }
            */
         }
      }
      else
      {
         fn = Lisp.eval.call(this, list[0]);
      }
      
      if (fn)
      {
         var args = new Array();
         list = list.slice(1);

         if (Lisp.specialForms[fnName])
         {
            args = list;
         }
         else
         {
            for (var i = 0; i < list.length; ++i)
            {
               if (typeof list[i] == "object" && list[i].length != undefined)
               {
                  args.push(Lisp.eval.call(this, list[i]));
               }
               else if (typeof list[i] == "string")
               {
                  // backquote
                  if (list[i] == "`")
                  {
                     ++i;
                     args.push(Lisp.global["`"].call(this, list[i]));
                  }
                  else if (list[i] == ",")
                  {
                     ++i;
                     args.push(Lisp.eval.call(this, list[i]));
                  }
                  // quote
                  else if (list[i] == "'")
                  {
                     ++i;
                     args.push(list[i]);
                  }
                  else
                  {
                     var context = this;
                     var atom = context[list[i]];
                     
                     var x = 0;
                     
                     while (atom == undefined && context.parent && context.parent !== context)
                     {
                        context = context.parent;
                        atom = context[list[i]];
                     }
                  
                     args.push(atom);
                  }
               }
               else
               {
                  args.push(list[i]);
               }
            }
         }

         ret = fn.apply(this, args);
      }
      else
      {
         throw new Error("undefined function " + fnName);
      }
   }
   else if (typeof list == "string")
   {
      var context = this;
      var atom = context[list];
      
      var x = 0;
      
      while (atom == undefined && context.parent && context.parent !== context)
      {
         context = context.parent;
         atom = context[list];
      }
   
      ret = atom;
   }
   else
   {
      ret = list;
   }

   Lisp.oneval(ret);
   return ret;
};


Lisp.dumpObject = function(object, element)
{
   var ol = document.createElement("ol");
   ol.start = "0"; //.listStyle = "none";
   var li = null;
   
   for (var i in object)
   {
      li = document.createElement("li");
      
      try
      {
         li.appendChild(document.createTextNode(i + " = " + object[i]));
      }
      catch (e)
      {
      }
      
      ol.appendChild(li);
   }

   element.appendChild(ol);
};


Lisp.getXMLHTTP = function()
{
   var obj = null;

   try
   {
      obj = new ActiveXObject("Msxml2.XMLHTTP");
   }
   catch (e)
   {
      try
      {
         obj = new ActiveXObject("Microsoft.XMLHTTP");
      } 
      catch (oc)
      {
         obj = null;
      }
   }
   
   if (!obj && typeof XMLHttpRequest != "undefined") 
   {
      obj = new XMLHttpRequest();
   }
   
   return obj;
}


Lisp.frameCount = 1;


Lisp.loadSrc = function(url, handler)
{
   var xmlHttp = Lisp.getXMLHTTP();
   
   if (xmlHttp)
   {
      if (xmlHttp.readyState != 0)
      {
         xmlHttp.abort()
      }
      
      xmlHttp.open("GET", url, true);
      
      xmlHttp.onreadystatechange = function() 
      {
         if (handler && xmlHttp.readyState == 4 && xmlHttp.responseText) 
         {
            handler(xmlHttp.responseText);
         }
      }
      
      xmlHttp.send(null)
   }
   else
   {
      // Code for Opera and other really lame browsers will be added here.
   }
}


Lisp.scripts = document.getElementsByTagName("SCRIPT");


Lisp.onload = window.onload;

var im_a_javascript_variable = 123;

window.onload = function()
{
   for (var i = 0; i < Lisp.scripts.length; ++i)
   {
      if (Lisp.scripts[i].type == "text/lisp")
      {
         if (Lisp.scripts[i].src)
         {
            var handler = function(text)
            {
               /*Lisp.*/interpret(text);
            };
            
            Lisp.loadSrc(Lisp.scripts[i].src, handler);
         }
         else
         {
            // alert(Lisp.scripts[i].text);
            /*Lisp.*/interpret(Lisp.scripts[i].text);
         }
      }
   }

   if (Lisp.onload)
   {
      Lisp.onload();
   }

};


// window.addEventListener("onload", Lisp.onload, true);
