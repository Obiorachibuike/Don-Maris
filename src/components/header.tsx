<header className="bg-card border-b sticky top-0 z-50 shadow-sm w-full">
  <div className="mx-auto w-full max-w-[1400px] px-4 sm:px-6 lg:px-8">
    <div className="flex items-center justify-between h-16 w-full">

      {/* LOGO */}
      <Link
        href="/"
        className="flex items-center gap-2 shrink-0"
        onClick={() => setSheetOpen(false)}
      >
        <Smartphone className="h-7 w-7 sm:h-8 sm:w-8 text-primary" />
        <span className="text-xl sm:text-2xl font-bold font-headline bg-gradient-to-br from-primary via-accent to-primary bg-clip-text text-transparent">
          Don Maris
        </span>
      </Link>

      {/* DESKTOP NAV */}
      <nav className="hidden md:flex items-center gap-1 ml-6">
        {visibleNavLinks.map((link) => (
          <NavLink key={link.href} {...link} />
        ))}
      </nav>

      {/* RIGHT ACTIONS */}
      <div className="flex items-center gap-2 sm:gap-4 shrink-0">

        {/* WALLET */}
        {isClient && user && user.role === "customer" && user.ledgerBalance > 0 && (
          <div className="hidden sm:flex items-center gap-2 bg-destructive/10 border border-destructive/20 px-3 py-1.5 rounded-md">
            <Wallet className="h-5 w-5 text-destructive" />
            <div className="flex flex-col items-end leading-tight">
              <span className="text-xs text-destructive font-medium">Balance</span>
              <span className="text-sm font-bold text-destructive">
                ${user.ledgerBalance.toFixed(2)}
              </span>
            </div>
          </div>
        )}

        {/* CART */}
        <Button variant="ghost" size="icon" asChild className="relative">
          <Link href="/cart">
            <ShoppingCart className="h-5 w-5" />
            {isClient && totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </Link>
        </Button>

        {/* USER MENU / LOGIN / SIGNUP */}
        {isClient && !isLoading && (
          <>
            {user ? (
              <div className="hidden md:block">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                      <Avatar className="h-full w-full">
                        <AvatarImage src={user.avatar || "https://placehold.co/100x100.png"} />
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <Link href="/profile" className="block p-1 rounded-md hover:bg-muted">
                        <div className="flex flex-col">
                          <span className="font-medium">{user.name}</span>
                          <span className="text-xs text-muted-foreground">{user.email}</span>
                        </div>
                      </Link>
                    </DropdownMenuLabel>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem asChild>
                      <Link href="/profile">
                        <ShoppingCart className="mr-2 h-4 w-4" /> My Orders
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem asChild>
                      <Link href="/profile">
                        <UserIcon className="mr-2 h-4 w-4" /> Profile
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem asChild>
                      <Link href="/settings">
                        <Settings className="mr-2 h-4 w-4" /> Settings
                      </Link>
                    </DropdownMenuItem>

                    {user.role !== "customer" && (
                      <DropdownMenuItem asChild>
                        <Link href="/admin">
                          <LayoutDashboard className="mr-2 h-4 w-4" /> Admin
                        </Link>
                      </DropdownMenuItem>
                    )}

                    <DropdownMenuSeparator />

                    <DropdownMenuItem onClick={logout}>
                      <LogOut className="mr-2 h-4 w-4" /> Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Button asChild variant="ghost">
                  <Link href="/login">
                    <LogIn className="mr-2" /> Login
                  </Link>
                </Button>

                <Button asChild>
                  <Link href="/signup">
                    <UserPlus className="mr-2" /> Sign Up
                  </Link>
                </Button>
              </div>
            )}
          </>
        )}

        {/* MOBILE MENU */}
        <div className="md:hidden">
          <Sheet open={isSheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>

            <SheetContent side="right" className="w-[85%] max-w-[320px]">
              <nav className="flex flex-col gap-4 mt-10">

                {visibleNavLinks.map((link) => (
                  <NavLink key={link.href} {...link} isMobile />
                ))}

                <div className="pt-4 border-t">

                  {user ? (
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-lg"
                      onClick={() => {
                        logout();
                        setSheetOpen(false);
                      }}
                    >
                      <LogOut className="mr-4" /> Logout
                    </Button>
                  ) : (
                    <>
                      <Button
                        asChild
                        variant="ghost"
                        className="w-full justify-start text-lg"
                      >
                        <Link href="/login" onClick={() => setSheetOpen(false)}>
                          <LogIn className="mr-4" /> Login
                        </Link>
                      </Button>

                      <Button
                        asChild
                        className="w-full justify-start text-lg mt-2"
                      >
                        <Link href="/signup" onClick={() => setSheetOpen(false)}>
                          <UserPlus className="mr-4" /> Sign Up
                        </Link>
                      </Button>
                    </>
                  )}
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </div>
  </div>
</header>