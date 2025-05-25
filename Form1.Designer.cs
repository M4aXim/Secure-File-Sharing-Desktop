using System;
using System.ComponentModel;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Windows.Forms;

namespace WindowsFormsApp2
{
    public partial class Form1 : Form
    {
        /// <summary>
        /// Required designer variable.
        /// </summary>
        private IContainer components = null;

        // Hero section
        private Panel heroPanel;
        private Label titleLabel;
        private Label subtitleLabel;
        private Label descriptionLabel;
        private Button loginButton;
        private Button createAccountButton;
        private Button lawButton;
        private PictureBox illustrationPictureBox;

        // Login form
        private Panel loginPanel;
        private Label loginTitleLabel;
        private Label loginSubtitleLabel;
        private Label loginUsernameLabel;
        private TextBox loginUsernameTextBox;
        private Label loginPasswordLabel;
        private TextBox loginPasswordTextBox;
        private Button forgotPasswordButton;
        private Button loginSubmitButton;
        private Button loginWithOtpButton;
        private LinkLabel loginRegisterLink;

        // OTP login form
        private Panel otpPanel;
        private Label otpTitleLabel;
        private Label otpSubtitleLabel;
        private Panel requestOtpPanel;
        private Label otpRequestEmailLabel;
        private TextBox otpEmailTextBox;
        private Button requestOtpButton;
        private Panel enterOtpPanel;
        private Label otpConfirmEmailLabel;
        private TextBox confirmOtpEmailTextBox;
        private Label otpCodeLabel;
        private TextBox otpCodeTextBox;
        private Button otpLoginButton;
        private LinkLabel resetOtpLinkLabel;
        private LinkLabel otpBackLinkLabel;

        // Register form
        private Panel registerPanel;
        private Label registerTitleLabel;
        private Label registerSubtitleLabel;
        private Label registerUsernameLabel;
        private TextBox registerUsernameTextBox;
        private Label registerEmailLabel;
        private TextBox registerEmailTextBox;
        private Label registerPasswordLabel;
        private TextBox registerPasswordTextBox;
        private Button registerSubmitButton;
        private LinkLabel registerLoginLink;

        /// <summary>
        /// Clean up any resources being used.
        /// </summary>
        protected override void Dispose(bool disposing)
        {
            if (disposing && (components != null))
            {
                components.Dispose();
            }
            base.Dispose(disposing);
        }

        #region Windows Form Designer generated code

        /// <summary>
        /// Initialize all components and layout to mirror the provided frontend.
        /// </summary>
        private void InitializeComponent()
        {
            this.components = new Container();

            //
            // Form1
            //
            this.SuspendLayout();
            this.AutoScroll = true;
            this.ClientSize = new Size(1000, 800);
            this.BackColor = Color.FromArgb(245, 245, 245);
            this.Name = "Form1";
            this.Text = "FileShare - Secure File Sharing";
            this.StartPosition = FormStartPosition.CenterScreen;

            //
            // heroPanel
            //
            this.heroPanel = new Panel();
            this.heroPanel.Name = "heroPanel";
            this.heroPanel.Location = new Point(50, 50);
            this.heroPanel.Size = new Size(900, 300);
            this.heroPanel.BackColor = Color.White;
            this.heroPanel.Padding = new Padding(30);
            this.heroPanel.BorderStyle = BorderStyle.None;
            this.heroPanel.Region = Region.FromHrgn(CreateRoundRectRgn(0, 0, 900, 300, 20, 20));

            // titleLabel
            this.titleLabel = new Label();
            this.titleLabel.Name = "titleLabel";
            this.titleLabel.AutoSize = true;
            this.titleLabel.Font = new Font("Segoe UI", 32F, FontStyle.Bold, GraphicsUnit.Point);
            this.titleLabel.ForeColor = Color.FromArgb(66, 133, 244);
            this.titleLabel.Location = new Point(30, 30);
            this.titleLabel.Text = "FileShare";

            // subtitleLabel
            this.subtitleLabel = new Label();
            this.subtitleLabel.Name = "subtitleLabel";
            this.subtitleLabel.AutoSize = true;
            this.subtitleLabel.Font = new Font("Segoe UI", 16F, FontStyle.Regular, GraphicsUnit.Point);
            this.subtitleLabel.ForeColor = Color.FromArgb(60, 60, 60);
            this.subtitleLabel.Location = new Point(30, 80);
            this.subtitleLabel.Text = "Secure and simple file sharing for everyone";

            // descriptionLabel
            this.descriptionLabel = new Label();
            this.descriptionLabel.Name = "descriptionLabel";
            this.descriptionLabel.AutoSize = true;
            this.descriptionLabel.Font = new Font("Segoe UI", 12F, FontStyle.Regular, GraphicsUnit.Point);
            this.descriptionLabel.ForeColor = Color.FromArgb(100, 100, 100);
            this.descriptionLabel.Location = new Point(30, 120);
            this.descriptionLabel.Text = "Share files with ease, access from anywhere, and keep your data secure.";

            // loginButton
            this.loginButton = new Button();
            this.loginButton.Name = "loginButton";
            this.loginButton.Text = "Login";
            this.loginButton.Font = new Font("Segoe UI", 12F, FontStyle.Regular, GraphicsUnit.Point);
            this.loginButton.Size = new Size(140, 45);
            this.loginButton.Location = new Point(30, 180);
            this.loginButton.BackColor = Color.FromArgb(66, 133, 244);
            this.loginButton.ForeColor = Color.White;
            this.loginButton.FlatStyle = FlatStyle.Flat;
            this.loginButton.FlatAppearance.BorderSize = 0;
            this.loginButton.Region = Region.FromHrgn(CreateRoundRectRgn(0, 0, 140, 45, 10, 10));
            this.loginButton.Click += new EventHandler(this.ShowLogin);

            // createAccountButton
            this.createAccountButton = new Button();
            this.createAccountButton.Name = "createAccountButton";
            this.createAccountButton.Text = "Create Account";
            this.createAccountButton.Font = new Font("Segoe UI", 12F, FontStyle.Regular, GraphicsUnit.Point);
            this.createAccountButton.Size = new Size(180, 45);
            this.createAccountButton.Location = new Point(190, 180);
            this.createAccountButton.BackColor = Color.FromArgb(52, 168, 83);
            this.createAccountButton.ForeColor = Color.White;
            this.createAccountButton.FlatStyle = FlatStyle.Flat;
            this.createAccountButton.FlatAppearance.BorderSize = 0;
            this.createAccountButton.Region = Region.FromHrgn(CreateRoundRectRgn(0, 0, 180, 45, 10, 10));
            this.createAccountButton.Click += new EventHandler(this.ShowRegister);

            // lawButton
            this.lawButton = new Button();
            this.lawButton.Name = "lawButton";
            this.lawButton.Text = "Law Enforcement";
            this.lawButton.Font = new Font("Segoe UI", 12F, FontStyle.Regular, GraphicsUnit.Point);
            this.lawButton.Size = new Size(180, 45);
            this.lawButton.Location = new Point(390, 180);
            this.lawButton.BackColor = Color.FromArgb(234, 67, 53);
            this.lawButton.ForeColor = Color.White;
            this.lawButton.FlatStyle = FlatStyle.Flat;
            this.lawButton.FlatAppearance.BorderSize = 0;
            this.lawButton.Region = Region.FromHrgn(CreateRoundRectRgn(0, 0, 180, 45, 10, 10));

            // add hero controls
            this.heroPanel.Controls.Add(this.titleLabel);
            this.heroPanel.Controls.Add(this.subtitleLabel);
            this.heroPanel.Controls.Add(this.descriptionLabel);
            this.heroPanel.Controls.Add(this.loginButton);
            this.heroPanel.Controls.Add(this.createAccountButton);
            this.heroPanel.Controls.Add(this.lawButton);
            this.heroPanel.Controls.Add(this.illustrationPictureBox);
            this.Controls.Add(this.heroPanel);

            //
            // loginPanel
            //
            this.loginPanel = new Panel();
            this.loginPanel.Name = "loginPanel";
            this.loginPanel.Location = new Point(300, 400);
            this.loginPanel.Size = new Size(400, 450);
            this.loginPanel.BackColor = Color.White;
            this.loginPanel.Padding = new Padding(30);
            this.loginPanel.BorderStyle = BorderStyle.None;
            this.loginPanel.Region = Region.FromHrgn(CreateRoundRectRgn(0, 0, 400, 450, 20, 20));
            this.loginPanel.Visible = false;

            // loginTitleLabel
            this.loginTitleLabel = new Label();
            this.loginTitleLabel.Name = "loginTitleLabel";
            this.loginTitleLabel.AutoSize = true;
            this.loginTitleLabel.Font = new Font("Segoe UI", 24F, FontStyle.Bold, GraphicsUnit.Point);
            this.loginTitleLabel.ForeColor = Color.FromArgb(60, 60, 60);
            this.loginTitleLabel.Location = new Point(30, 30);
            this.loginTitleLabel.Text = "Welcome Back";

            // loginSubtitleLabel
            this.loginSubtitleLabel = new Label();
            this.loginSubtitleLabel.Name = "loginSubtitleLabel";
            this.loginSubtitleLabel.AutoSize = true;
            this.loginSubtitleLabel.Font = new Font("Segoe UI", 12F, FontStyle.Regular, GraphicsUnit.Point);
            this.loginSubtitleLabel.ForeColor = Color.FromArgb(100, 100, 100);
            this.loginSubtitleLabel.Location = new Point(30, 70);
            this.loginSubtitleLabel.Text = "Log in to access your files";

            // loginUsernameLabel
            this.loginUsernameLabel = new Label();
            this.loginUsernameLabel.Name = "loginUsernameLabel";
            this.loginUsernameLabel.AutoSize = true;
            this.loginUsernameLabel.Font = new Font("Segoe UI", 11F, FontStyle.Regular, GraphicsUnit.Point);
            this.loginUsernameLabel.ForeColor = Color.FromArgb(60, 60, 60);
            this.loginUsernameLabel.Location = new Point(30, 120);
            this.loginUsernameLabel.Text = "Username";

            // loginUsernameTextBox
            this.loginUsernameTextBox = new TextBox();
            this.loginUsernameTextBox.Name = "loginUsernameTextBox";
            this.loginUsernameTextBox.Font = new Font("Segoe UI", 11F, FontStyle.Regular, GraphicsUnit.Point);
            this.loginUsernameTextBox.Location = new Point(30, 145);
            this.loginUsernameTextBox.Size = new Size(340, 35);
            this.loginUsernameTextBox.BorderStyle = BorderStyle.FixedSingle;

            // loginPasswordLabel
            this.loginPasswordLabel = new Label();
            this.loginPasswordLabel.Name = "loginPasswordLabel";
            this.loginPasswordLabel.AutoSize = true;
            this.loginPasswordLabel.Font = new Font("Segoe UI", 11F, FontStyle.Regular, GraphicsUnit.Point);
            this.loginPasswordLabel.ForeColor = Color.FromArgb(60, 60, 60);
            this.loginPasswordLabel.Location = new Point(30, 190);
            this.loginPasswordLabel.Text = "Password";

            // loginPasswordTextBox
            this.loginPasswordTextBox = new TextBox();
            this.loginPasswordTextBox.Name = "loginPasswordTextBox";
            this.loginPasswordTextBox.Font = new Font("Segoe UI", 11F, FontStyle.Regular, GraphicsUnit.Point);
            this.loginPasswordTextBox.Location = new Point(30, 215);
            this.loginPasswordTextBox.Size = new Size(340, 35);
            this.loginPasswordTextBox.BorderStyle = BorderStyle.FixedSingle;
            this.loginPasswordTextBox.UseSystemPasswordChar = true;

            // forgotPasswordButton
            this.forgotPasswordButton = new Button();
            this.forgotPasswordButton.Name = "forgotPasswordButton";
            this.forgotPasswordButton.Text = "Forgot Password?";
            this.forgotPasswordButton.Font = new Font("Segoe UI", 10F, FontStyle.Regular, GraphicsUnit.Point);
            this.forgotPasswordButton.Size = new Size(140, 30);
            this.forgotPasswordButton.Location = new Point(230, 260);
            this.forgotPasswordButton.FlatStyle = FlatStyle.Flat;
            this.forgotPasswordButton.FlatAppearance.BorderSize = 0;
            this.forgotPasswordButton.ForeColor = Color.FromArgb(66, 133, 244);
            this.forgotPasswordButton.BackColor = Color.Transparent;
            this.forgotPasswordButton.Click += new EventHandler(this.forgotPassword);

            // loginSubmitButton
            this.loginSubmitButton = new Button();
            this.loginSubmitButton.Name = "loginSubmitButton";
            this.loginSubmitButton.Text = "Login";
            this.loginSubmitButton.Font = new Font("Segoe UI", 12F, FontStyle.Regular, GraphicsUnit.Point);
            this.loginSubmitButton.Size = new Size(340, 45);
            this.loginSubmitButton.Location = new Point(30, 300);
            this.loginSubmitButton.BackColor = Color.FromArgb(66, 133, 244);
            this.loginSubmitButton.ForeColor = Color.White;
            this.loginSubmitButton.FlatStyle = FlatStyle.Flat;
            this.loginSubmitButton.FlatAppearance.BorderSize = 0;
            this.loginSubmitButton.Region = Region.FromHrgn(CreateRoundRectRgn(0, 0, 340, 45, 10, 10));
            this.loginSubmitButton.Click += new EventHandler(this.login);

            // loginWithOtpButton
            this.loginWithOtpButton = new Button();
            this.loginWithOtpButton.Name = "loginWithOtpButton";
            this.loginWithOtpButton.Text = "Login with One-Time Password";
            this.loginWithOtpButton.Font = new Font("Segoe UI", 10F, FontStyle.Regular, GraphicsUnit.Point);
            this.loginWithOtpButton.Size = new Size(200, 30);
            this.loginWithOtpButton.Location = new Point(100, 360);
            this.loginWithOtpButton.FlatStyle = FlatStyle.Flat;
            this.loginWithOtpButton.FlatAppearance.BorderSize = 0;
            this.loginWithOtpButton.ForeColor = Color.FromArgb(66, 133, 244);
            this.loginWithOtpButton.BackColor = Color.Transparent;
            this.loginWithOtpButton.Click += new EventHandler(this.ShowOTPLogin);

            // loginRegisterLink
            this.loginRegisterLink = new LinkLabel();
            this.loginRegisterLink.Name = "loginRegisterLink";
            this.loginRegisterLink.Text = "Don't have an account? Register here";
            this.loginRegisterLink.AutoSize = true;
            this.loginRegisterLink.Font = new Font("Segoe UI", 10F, FontStyle.Regular, GraphicsUnit.Point);
            this.loginRegisterLink.Location = new Point(100, 400);
            this.loginRegisterLink.LinkBehavior = LinkBehavior.HoverUnderline;
            this.loginRegisterLink.LinkColor = Color.FromArgb(66, 133, 244);
            this.loginRegisterLink.LinkClicked += new LinkLabelLinkClickedEventHandler(this.ShowRegister);

            // add loginPanel controls
            this.loginPanel.Controls.Add(this.loginTitleLabel);
            this.loginPanel.Controls.Add(this.loginSubtitleLabel);
            this.loginPanel.Controls.Add(this.loginUsernameLabel);
            this.loginPanel.Controls.Add(this.loginUsernameTextBox);
            this.loginPanel.Controls.Add(this.loginPasswordLabel);
            this.loginPanel.Controls.Add(this.loginPasswordTextBox);
            this.loginPanel.Controls.Add(this.forgotPasswordButton);
            this.loginPanel.Controls.Add(this.loginSubmitButton);
            this.loginPanel.Controls.Add(this.loginWithOtpButton);
            this.loginPanel.Controls.Add(this.loginRegisterLink);
            this.Controls.Add(this.loginPanel);

            //
            // otpPanel
            //
            this.otpPanel = new Panel();
            this.otpPanel.Name = "otpPanel";
            this.otpPanel.Location = new Point(200, 220);
            this.otpPanel.Size = new Size(400, 300);
            this.otpPanel.BorderStyle = BorderStyle.FixedSingle;
            this.otpPanel.Visible = false;

            // otpTitleLabel
            this.otpTitleLabel = new Label();
            this.otpTitleLabel.Name = "otpTitleLabel";
            this.otpTitleLabel.AutoSize = true;
            this.otpTitleLabel.Font = new Font("Segoe UI", 14F, FontStyle.Bold, GraphicsUnit.Point);
            this.otpTitleLabel.Location = new Point(50, 10);
            this.otpTitleLabel.Text = "Login with One-Time Password";

            // otpSubtitleLabel
            this.otpSubtitleLabel = new Label();
            this.otpSubtitleLabel.Name = "otpSubtitleLabel";
            this.otpSubtitleLabel.AutoSize = true;
            this.otpSubtitleLabel.Font = new Font("Segoe UI", 10F, FontStyle.Regular, GraphicsUnit.Point);
            this.otpSubtitleLabel.ForeColor = Color.Gray;
            this.otpSubtitleLabel.Location = new Point(50, 40);
            this.otpSubtitleLabel.Text = "Enter your email to receive a code";

            // requestOtpPanel
            this.requestOtpPanel = new Panel();
            this.requestOtpPanel.Name = "requestOtpPanel";
            this.requestOtpPanel.Location = new Point(10, 70);
            this.requestOtpPanel.Size = new Size(380, 80);

            // otpRequestEmailLabel
            this.otpRequestEmailLabel = new Label();
            this.otpRequestEmailLabel.Name = "otpRequestEmailLabel";
            this.otpRequestEmailLabel.AutoSize = true;
            this.otpRequestEmailLabel.Font = new Font("Segoe UI", 10F, FontStyle.Regular, GraphicsUnit.Point);
            this.otpRequestEmailLabel.Location = new Point(10, 10);
            this.otpRequestEmailLabel.Text = "Email";

            // otpEmailTextBox
            this.otpEmailTextBox = new TextBox();
            this.otpEmailTextBox.Name = "otpEmailTextBox";
            this.otpEmailTextBox.Font = new Font("Segoe UI", 10F, FontStyle.Regular, GraphicsUnit.Point);
            this.otpEmailTextBox.Location = new Point(10, 30);
            this.otpEmailTextBox.Size = new Size(360, 25);

            // requestOtpButton
            this.requestOtpButton = new Button();
            this.requestOtpButton.Name = "requestOtpButton";
            this.requestOtpButton.Text = "Send One-Time Password";
            this.requestOtpButton.Font = new Font("Segoe UI", 10F, FontStyle.Regular, GraphicsUnit.Point);
            this.requestOtpButton.Size = new Size(360, 30);
            this.requestOtpButton.Location = new Point(10, 60);
            this.requestOtpButton.BackColor = Color.FromArgb(51, 204, 204);
            this.requestOtpButton.ForeColor = Color.White;
            this.requestOtpButton.FlatStyle = FlatStyle.Flat;
            this.requestOtpButton.Click += new EventHandler(this.requestOTP);

            // add requestOtpPanel controls
            this.requestOtpPanel.Controls.Add(this.otpRequestEmailLabel);
            this.requestOtpPanel.Controls.Add(this.otpEmailTextBox);
            this.requestOtpPanel.Controls.Add(this.requestOtpButton);

            // enterOtpPanel
            this.enterOtpPanel = new Panel();
            this.enterOtpPanel.Name = "enterOtpPanel";
            this.enterOtpPanel.Location = new Point(10, 160);
            this.enterOtpPanel.Size = new Size(380, 120);
            this.enterOtpPanel.Visible = false;

            // otpConfirmEmailLabel
            this.otpConfirmEmailLabel = new Label();
            this.otpConfirmEmailLabel.Name = "otpConfirmEmailLabel";
            this.otpConfirmEmailLabel.AutoSize = true;
            this.otpConfirmEmailLabel.Font = new Font("Segoe UI", 10F, FontStyle.Regular, GraphicsUnit.Point);
            this.otpConfirmEmailLabel.Location = new Point(10, 10);
            this.otpConfirmEmailLabel.Text = "Email";

            // confirmOtpEmailTextBox
            this.confirmOtpEmailTextBox = new TextBox();
            this.confirmOtpEmailTextBox.Name = "confirmOtpEmailTextBox";
            this.confirmOtpEmailTextBox.Font = new Font("Segoe UI", 10F, FontStyle.Regular, GraphicsUnit.Point);
            this.confirmOtpEmailTextBox.Location = new Point(10, 30);
            this.confirmOtpEmailTextBox.Size = new Size(360, 25);
            this.confirmOtpEmailTextBox.ReadOnly = true;

            // otpCodeLabel
            this.otpCodeLabel = new Label();
            this.otpCodeLabel.Name = "otpCodeLabel";
            this.otpCodeLabel.AutoSize = true;
            this.otpCodeLabel.Font = new Font("Segoe UI", 10F, FontStyle.Regular, GraphicsUnit.Point);
            this.otpCodeLabel.Location = new Point(10, 60);
            this.otpCodeLabel.Text = "One-Time Password";

            // otpCodeTextBox
            this.otpCodeTextBox = new TextBox();
            this.otpCodeTextBox.Name = "otpCodeTextBox";
            this.otpCodeTextBox.Font = new Font("Segoe UI", 10F, FontStyle.Regular, GraphicsUnit.Point);
            this.otpCodeTextBox.Location = new Point(10, 80);
            this.otpCodeTextBox.Size = new Size(360, 25);
            this.otpCodeTextBox.MaxLength = 6;

            // otpLoginButton
            this.otpLoginButton = new Button();
            this.otpLoginButton.Name = "otpLoginButton";
            this.otpLoginButton.Text = "Login";
            this.otpLoginButton.Font = new Font("Segoe UI", 10F, FontStyle.Regular, GraphicsUnit.Point);
            this.otpLoginButton.Size = new Size(360, 30);
            this.otpLoginButton.Location = new Point(10, 110);
            this.otpLoginButton.BackColor = Color.FromArgb(66, 133, 244);
            this.otpLoginButton.ForeColor = Color.White;
            this.otpLoginButton.FlatStyle = FlatStyle.Flat;
            this.otpLoginButton.Click += new EventHandler(this.loginWithOTP);

            // resetOtpLinkLabel
            this.resetOtpLinkLabel = new LinkLabel();
            this.resetOtpLinkLabel.Name = "resetOtpLinkLabel";
            this.resetOtpLinkLabel.Text = "Use a different email";
            this.resetOtpLinkLabel.AutoSize = true;
            this.resetOtpLinkLabel.Font = new Font("Segoe UI", 8F, FontStyle.Regular, GraphicsUnit.Point);
            this.resetOtpLinkLabel.Location = new Point(10, 145);
            this.resetOtpLinkLabel.LinkBehavior = LinkBehavior.HoverUnderline;
            this.resetOtpLinkLabel.LinkClicked += new LinkLabelLinkClickedEventHandler(this.resetOTPForm);

            // otpBackLink
            this.otpBackLinkLabel = new LinkLabel();
            this.otpBackLinkLabel.Name = "otpBackLinkLabel";
            this.otpBackLinkLabel.Text = "Back to normal login";
            this.otpBackLinkLabel.AutoSize = true;
            this.otpBackLinkLabel.Font = new Font("Segoe UI", 8F, FontStyle.Regular, GraphicsUnit.Point);
            this.otpBackLinkLabel.Location = new Point(250, 145);
            this.otpBackLinkLabel.LinkBehavior = LinkBehavior.HoverUnderline;
            this.otpBackLinkLabel.LinkClicked += new LinkLabelLinkClickedEventHandler(this.ShowLogin);

            // add enterOtpPanel controls
            this.enterOtpPanel.Controls.Add(this.otpConfirmEmailLabel);
            this.enterOtpPanel.Controls.Add(this.confirmOtpEmailTextBox);
            this.enterOtpPanel.Controls.Add(this.otpCodeLabel);
            this.enterOtpPanel.Controls.Add(this.otpCodeTextBox);
            this.enterOtpPanel.Controls.Add(this.otpLoginButton);
            this.enterOtpPanel.Controls.Add(this.resetOtpLinkLabel);
            this.enterOtpPanel.Controls.Add(this.otpBackLinkLabel);

            // add otpPanel controls
            this.otpPanel.Controls.Add(this.otpTitleLabel);
            this.otpPanel.Controls.Add(this.otpSubtitleLabel);
            this.otpPanel.Controls.Add(this.requestOtpPanel);
            this.otpPanel.Controls.Add(this.enterOtpPanel);
            this.Controls.Add(this.otpPanel);

            //
            // registerPanel
            //
            this.registerPanel = new Panel();
            this.registerPanel.Name = "registerPanel";
            this.registerPanel.Location = new Point(200, 220);
            this.registerPanel.Size = new Size(400, 300);
            this.registerPanel.BorderStyle = BorderStyle.FixedSingle;
            this.registerPanel.Visible = false;

            // registerTitleLabel
            this.registerTitleLabel = new Label();
            this.registerTitleLabel.Name = "registerTitleLabel";
            this.registerTitleLabel.AutoSize = true;
            this.registerTitleLabel.Font = new Font("Segoe UI", 14F, FontStyle.Bold, GraphicsUnit.Point);
            this.registerTitleLabel.Location = new Point(80, 10);
            this.registerTitleLabel.Text = "Create an Account";

            // registerSubtitleLabel
            this.registerSubtitleLabel = new Label();
            this.registerSubtitleLabel.Name = "registerSubtitleLabel";
            this.registerSubtitleLabel.AutoSize = true;
            this.registerSubtitleLabel.Font = new Font("Segoe UI", 10F, FontStyle.Regular, GraphicsUnit.Point);
            this.registerSubtitleLabel.ForeColor = Color.Gray;
            this.registerSubtitleLabel.Location = new Point(80, 40);
            this.registerSubtitleLabel.Text = "Join our secure file sharing platform";

            // registerUsernameLabel
            this.registerUsernameLabel = new Label();
            this.registerUsernameLabel.Name = "registerUsernameLabel";
            this.registerUsernameLabel.AutoSize = true;
            this.registerUsernameLabel.Font = new Font("Segoe UI", 10F, FontStyle.Regular, GraphicsUnit.Point);
            this.registerUsernameLabel.Location = new Point(20, 80);
            this.registerUsernameLabel.Text = "Username";

            // registerUsernameTextBox
            this.registerUsernameTextBox = new TextBox();
            this.registerUsernameTextBox.Name = "registerUsernameTextBox";
            this.registerUsernameTextBox.Font = new Font("Segoe UI", 10F, FontStyle.Regular, GraphicsUnit.Point);
            this.registerUsernameTextBox.Location = new Point(20, 100);
            this.registerUsernameTextBox.Size = new Size(360, 25);

            // registerEmailLabel
            this.registerEmailLabel = new Label();
            this.registerEmailLabel.Name = "registerEmailLabel";
            this.registerEmailLabel.AutoSize = true;
            this.registerEmailLabel.Font = new Font("Segoe UI", 10F, FontStyle.Regular, GraphicsUnit.Point);
            this.registerEmailLabel.Location = new Point(20, 140);
            this.registerEmailLabel.Text = "Email";

            // registerEmailTextBox
            this.registerEmailTextBox = new TextBox();
            this.registerEmailTextBox.Name = "registerEmailTextBox";
            this.registerEmailTextBox.Font = new Font("Segoe UI", 10F, FontStyle.Regular, GraphicsUnit.Point);
            this.registerEmailTextBox.Location = new Point(20, 160);
            this.registerEmailTextBox.Size = new Size(360, 25);

            // registerPasswordLabel
            this.registerPasswordLabel = new Label();
            this.registerPasswordLabel.Name = "registerPasswordLabel";
            this.registerPasswordLabel.AutoSize = true;
            this.registerPasswordLabel.Font = new Font("Segoe UI", 10F, FontStyle.Regular, GraphicsUnit.Point);
            this.registerPasswordLabel.Location = new Point(20, 200);
            this.registerPasswordLabel.Text = "Password";

            // registerPasswordTextBox
            this.registerPasswordTextBox = new TextBox();
            this.registerPasswordTextBox.Name = "registerPasswordTextBox";
            this.registerPasswordTextBox.Font = new Font("Segoe UI", 10F, FontStyle.Regular, GraphicsUnit.Point);
            this.registerPasswordTextBox.Location = new Point(20, 220);
            this.registerPasswordTextBox.Size = new Size(360, 25);
            this.registerPasswordTextBox.UseSystemPasswordChar = true;

            // registerSubmitButton
            this.registerSubmitButton = new Button();
            this.registerSubmitButton.Name = "registerSubmitButton";
            this.registerSubmitButton.Text = "Create Account";
            this.registerSubmitButton.Font = new Font("Segoe UI", 10F, FontStyle.Regular, GraphicsUnit.Point);
            this.registerSubmitButton.Size = new Size(360, 35);
            this.registerSubmitButton.Location = new Point(20, 260);
            this.registerSubmitButton.BackColor = Color.FromArgb(52, 168, 83);
            this.registerSubmitButton.ForeColor = Color.White;
            this.registerSubmitButton.FlatStyle = FlatStyle.Flat;
            this.registerSubmitButton.Click += new EventHandler(this.register);

            // registerLoginLink
            this.registerLoginLink = new LinkLabel();
            this.registerLoginLink.Name = "registerLoginLink";
            this.registerLoginLink.Text = "Already have an account? Login here";
            this.registerLoginLink.AutoSize = true;
            this.registerLoginLink.Font = new Font("Segoe UI", 8F, FontStyle.Regular, GraphicsUnit.Point);
            this.registerLoginLink.Location = new Point(100, 305);
            this.registerLoginLink.LinkBehavior = LinkBehavior.HoverUnderline;
            this.registerLoginLink.LinkClicked += new LinkLabelLinkClickedEventHandler(this.ShowLogin);

            // add registerPanel controls
            this.registerPanel.Controls.Add(this.registerTitleLabel);
            this.registerPanel.Controls.Add(this.registerSubtitleLabel);
            this.registerPanel.Controls.Add(this.registerUsernameLabel);
            this.registerPanel.Controls.Add(this.registerUsernameTextBox);
            this.registerPanel.Controls.Add(this.registerEmailLabel);
            this.registerPanel.Controls.Add(this.registerEmailTextBox);
            this.registerPanel.Controls.Add(this.registerPasswordLabel);
            this.registerPanel.Controls.Add(this.registerPasswordTextBox);
            this.registerPanel.Controls.Add(this.registerSubmitButton);
            this.registerPanel.Controls.Add(this.registerLoginLink);
            this.Controls.Add(this.registerPanel);

            this.ResumeLayout(false);
        }

        [System.Runtime.InteropServices.DllImport("Gdi32.dll", EntryPoint = "CreateRoundRectRgn")]
        private static extern IntPtr CreateRoundRectRgn(int nLeftRect, int nTopRect, int nRightRect, int nBottomRect, int nWidthEllipse, int nHeightEllipse);

        #endregion
    }
}
