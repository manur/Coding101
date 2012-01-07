
(defun turn_left 
  ()
  (setq direction (% (+ direction 1) 4))
  (print 'Left)
)

(defun turn_right
  ()
  (setq direction (% (- direction 1) 4))
  (print 'Right)
)

(defun north
  ()
  (setq direction 0)
)

(defun east
  ()
  (setq direction 1)
)


(defun south
  ()
  (setq direction 2)
)


(defun west
  ()
  (setq direction 3)
)

#{program}
