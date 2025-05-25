using System;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Windows.Forms;

namespace WindowsFormsApp2
{
    public partial class Form1 : Form
    {
        public Form1()
        {
            InitializeComponent();
            ShowHero(null, null);
        }

        // Navigation methods
        private void ShowLogin(object sender, EventArgs e) => ShowPanel("login");
        private void ShowRegister(object sender, EventArgs e) => ShowPanel("register");
        private void ShowOTPLogin(object sender, EventArgs e) => ShowPanel("otp");
        private void ShowHero(object sender, EventArgs e) => ShowPanel("hero");

        // Functional methods
        private void forgotPassword(object sender, EventArgs e) => MessageBox.Show("Forgot password clicked.");
        private void login(object sender, EventArgs e) => MessageBox.Show("Login clicked.");
        private void loginWithOTP(object sender, EventArgs e) => MessageBox.Show("Login with OTP clicked.");
        private void requestOTP(object sender, EventArgs e) => MessageBox.Show("OTP request sent.");
        private void register(object sender, EventArgs e) => MessageBox.Show("Register clicked.");
        private void resetOTPForm(object sender, EventArgs e) => MessageBox.Show("Re    set OTP Form.");

        // Helper to toggle panels
        private void ShowPanel(string name)
        {
            heroPanel.Visible = name == "hero";
            loginPanel.Visible = name == "login";
            registerPanel.Visible = name == "register";
            otpPanel.Visible = name == "otp";
        }
    }

    // Extension method for rounded rectangles
    public static class GraphicsExtensions
    {
        public static void FillRoundedRectangle(this Graphics graphics, Brush brush, int x, int y, int width, int height, int radius)
        {
            GraphicsPath path = new GraphicsPath();
            path.AddArc(x, y, radius * 2, radius * 2, 180, 90);
            path.AddArc(x + width - radius * 2, y, radius * 2, radius * 2, 270, 90);
            path.AddArc(x + width - radius * 2, y + height - radius * 2, radius * 2, radius * 2, 0, 90);
            path.AddArc(x, y + height - radius * 2, radius * 2, radius * 2, 90, 90);
            path.CloseAllFigures();
            graphics.FillPath(brush, path);
            path.Dispose();
        }
    }
}
